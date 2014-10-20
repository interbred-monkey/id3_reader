
// include some libraries
var _           = require('underscore'),
    fs          = require('fs'),
    async       = require('async'),
    Buffer      = require('buffer').Buffer;

// globals
var _instance = null;

var tagReader = function(params, callback) {

  _instance = this;

  var actions = _instance.buildActions(params);

  async.series(actions, function(err) {

    if (!_.isNull(err)){

      return callback('Unable to process file');

    }

    return callback(null, _instance.tag_content)

  })

}

tagReader.prototype = {
  file_path: null,
  file_content: null,
  tag_size: null,
  tag_content: null
}

tagReader.prototype.buildActions = function(params) {

  if (Buffer.isBuffer(params)) {

    _instance.file_content = params;

    var actions = [
      _instance.loadHeader,
      _instance.loadTags
    ]

    return actions;

  }

  _instance.file_path = params.file_path;

  var actions = [
    _instance.readFile,
    _instance.loadHeader,
    _instance.loadTags
  ]

  actions.unshift(function(cb) {

    if (!_.isString(_instance.file_path)) {

      return cb("File does not exist");

    }

    fs.exists(_instance.file_path, function(exists) {

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

  var header = _instance.file_content.slice(0, 10);

  if (header.slice(0, 3).toString() !== 'ID3') {

    return callback("No ID3 tags");

  }

  _instance.tag_size = _instance.id3Size(header.slice(6,10));

  _instance.tag_content = {
    version: '2.'+header.readUInt8(3)+'.'+header.readUInt8(4)
  }

  return callback(null);

}

// load the actual tag data
tagReader.prototype.loadTags = function(callback) {

  var tags = _instance.file_content.slice(0, _instance.tag_size);

  _instance.tag_content.tags = tags;

  return callback(null);

}

// opens a file for reading
tagReader.prototype.readFile = function(callback) {

  fs.readFile(_instance.file_path, function(err, file_content) {

    if (err !== null) {

      return callback(err);

    }

    _instance.file_content = file_content;

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