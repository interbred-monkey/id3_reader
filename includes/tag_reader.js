
// include some libraries
var _           = require('underscore'),
    fs          = require('fs'),
    async       = require('async'),
    Buffer      = require('buffer').Buffer;

var tagReader = function(params, callback) {

  var _instance = this;
  this.buffer = null;
  this.path = null;
  this.file_handle = null;
  this.tag_size = null;
  this.tag_content = null;


  this.main = function(params, callback){
    var actions = _instance.buildActions(params);

    async.series(actions, function(err) {

      if (!_.isNull(err)){

        return callback('Unable to process file' + err);

      }

      return callback(null, _instance.tag_content)

    })
  }

  // function definitions for tagReader

  this.buildActions = function(params) {

    if (Buffer.isBuffer(params)) {

      _instance.buffer = params;

      var actions = [
        _instance.loadHeader,
        _instance.loadTagBuffer
      ]

      return actions;

    }

    // read the buffer from a file
    _instance.path = params;

    var actions = [
      _instance.openFile,
      _instance.readHeaderBuffer,
      _instance.loadHeader,
      _instance.readTagBuffer,
      _instance.loadTagBuffer,
      _instance.closeFile
    ]

    actions.unshift(function(cb) {

      if (!_.isString(_instance.path)) {

        return cb("File does not exist");

      }

      fs.exists(_instance.path, function(exists) {

        if (!exists) {

          return cb('File does not exist');

        }

        return cb(null);

      })

    })

    return actions;

  }

  // loads the details about the tag size etc
  this.loadHeader = function(callback) {

    var header = _instance.buffer.slice(0, 10);

    if (header.slice(0, 3).toString() !== 'ID3') {

      return callback("No ID3 tags");

    }

    _instance.tag_size = _instance.id3Size(header.slice(6,10));

    _instance.tag_content = {
      version: '2.'+header.readUInt8(3)+'.'+header.readUInt8(4)
    }

    return callback(null);

  }

  this.loadTagBuffer = function(callback) {

    _instance.tag_content.tags = _instance.buffer.slice(0, _instance.tag_size);

    return callback(null);

  }

  this.openFile = function(callback) {

    fs.open(_instance.path, 'r', function(err, file_handle) {

      if (err) {

        return callback("Unable to open file");

      }

      _instance.file_handle = file_handle;

      return callback(null);

    })

  }

  this.closeFile = function(callback) {

    fs.close(_instance.file_handle, function(err) {

      if (err) {

        return callback("Unable to close file" + err);

      }

      return callback(null);

    })

  }

  this.readHeaderBuffer = function(callback) {

    var header_buffer = new Buffer(10);

    fs.read(_instance.file_handle, header_buffer, 0, 10, 0, function(err, data) {

      if (err) {

        return callback("Unable to read file");

      }

      _instance.buffer = header_buffer;

      return callback(null);

    })

  }

  this.readTagBuffer = function(callback) {

    var tag_buffer = new Buffer(_instance.tag_size);

    fs.read(_instance.file_handle, tag_buffer, 0, _instance.tag_size, 0, function(err, data) {

      if (err) {

        return callback("Unable to read file");

      }

      _instance.buffer = tag_buffer;

      return callback(null);

    })

  }

  // get the size of the tag
  this.id3Size = function (buffer) {

    var integer = ((buffer[0] & 0x7F) << 21 ) |
                  ((buffer[1] & 0x7F) << 14) |
                  ((buffer[2] & 0x7F) << 7) |
                  (buffer[3] & 0x7F);

    return integer;

  }


  this.main(params, callback);
}

module.exports = tagReader;
