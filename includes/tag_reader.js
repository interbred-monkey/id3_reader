
// include some libraries
var _           = require('underscore'),
    fs          = require('fs'),
    async       = require('async'),
    Buffer      = require('buffer').Buffer;

var tagReader = function(params, callback) {
    var _this = this,
        actions = this.buildActions(params);

  async.series(actions, function(err) {

    if (!_.isNull(err)){

      return callback('Unable to process file');

    }
        return callback(null, _this.tag_content);
  })

}

tagReader.prototype = {
  buffer: null,
  path: null,
  file_handle: null,
  tag_size: null,
  tag_content: null
}

tagReader.prototype.buildActions = function(params) {
    var _this = this;
  if (Buffer.isBuffer(params)) {

    this.buffer = params;

    var actions = [
      this.loadHeader,
      this.loadTagBuffer
    ]

    return actions;

  }

  // read the buffer from a file
  this.path = params;

  var actions = [
    this.openFile.bind(this),
    this.readHeaderBuffer.bind(this),
    this.loadHeader.bind(this),
    this.readTagBuffer.bind(this),
    this.loadTagBuffer.bind(this),
    this.closeFile.bind(this)
  ]

  actions.unshift(function(cb) {

    if (!_.isString(_this.path)) {

      return cb("File does not exist");

    }

    fs.exists(_this.path, function(exists) {

      if (!exists) {

        return cb('File does not exist');

      }

      return cb(null);

    })

  })

  return actions;

}

// loads the details about the tag size etc
tagReader.prototype.loadHeader = function(callback) {

  var header = this.buffer.slice(0, 10);

  if (header.slice(0, 3).toString() !== 'ID3') {

    return callback("No ID3 tags");

  }

  this.tag_size = this.id3Size(header.slice(6,10));

  this.tag_content = {
    version: '2.'+header.readUInt8(3)+'.'+header.readUInt8(4)
  }

  return callback(null);

}

tagReader.prototype.loadTagBuffer = function(callback) {
  this.tag_content.tags = this.buffer.slice(0, this.tag_size);

  return callback(null);

}

tagReader.prototype.openFile = function(callback) {
    var _this = this;
   fs.open(this.path, 'r', function (err, file_handle) {

    if (err) {

      return callback("Unable to open file");

    }

    _this.file_handle = file_handle;

    return callback(null);

  })

}

tagReader.prototype.closeFile = function(callback) {
  fs.close(this.file_handle, function(err) {

    if (err) {

      return callback("Unable to close file");

    }

    return callback(null);

  })

}

tagReader.prototype.readHeaderBuffer = function(callback) {
    var _this = this,
        header_buffer = new Buffer(10);

  fs.read(this.file_handle, header_buffer, 0, 10, 0, function(err, data) {

    if (err) {

      return callback("Unable to read file");

    }

    _this.buffer = header_buffer;

    return callback(null);

  })

}

tagReader.prototype.readTagBuffer = function(callback) {
    var _this = this,
        tag_buffer = new Buffer(this.tag_size);

  fs.read(this.file_handle, tag_buffer, 0, this.tag_size, 0, function(err, data) {

    if (err) {

      return callback("Unable to read file");

    }

    _this.buffer = tag_buffer;

    return callback(null);

  })

}

// get the size of the tag
tagReader.prototype.id3Size = function (buffer) {

  var integer = ((buffer[0] & 0x7F) << 21 ) |
                ((buffer[1] & 0x7F) << 14) |
                ((buffer[2] & 0x7F) << 7) |
                (buffer[3] & 0x7F);

  return integer;

}

module.exports = tagReader;