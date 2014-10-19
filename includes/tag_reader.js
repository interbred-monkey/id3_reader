
// include some libraries
var _           = require('underscore'),
    fs          = require('fs'),
    async       = require('async'),
    Buffer      = require('buffer').Buffer;

// globals
var _instance = null;

var tagReader = function(params, callback) {

  _instance = this;

  if (Buffer.isBuffer(params)) {



  }

  _instance.file_path = params.file_path;
  (!_.isUndefined(params.open_flag)?_instance.open_flag = params.open_flag:'');

  var actions = [
    _instance.openFile,
    _instance.loadHeader,
    _instance.loadTags,
    _instance.closeFile
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

  async.series(actions, function(err) {

    if (!_.isNull(err)){

      return callback('Unable to process file');

    }

    return callback(null, _instance.file_content)

  })

}

tagReader.prototype = {
  file_path: null,
  open_flag: 'r',
  tag_size: null,
  file_handle: null,
  file_content: null
}

tagReader.prototype.buildActions = function() {

  

}

// loads the details about the tag size etc
tagReader.prototype.loadHeader = function(callback) {

  var header = new Buffer(10);

  fs.read(_instance.file_handle, header, 0, 10, 0, function(err, data) {

    if (err !== null) {

      return callback(err);

    }

    if (header.slice(0, 3).toString() !== 'ID3') {

      return callback("No ID3 tags");

    }

    _instance.tag_size = _instance.id3Size(header.slice(6,10));

    _instance.file_content = {
      version: '2.'+header.readUInt8(3)+'.'+header.readUInt8(4)
    }

    return callback(null);

  });

}

// load the actual tag data
tagReader.prototype.loadTags = function(callback) {

  var tags = new Buffer(_instance.tag_size);

  fs.read(_instance.file_handle, tags, 0, _instance.tag_size, 0, function(err, data) {

    if (err !== null) {

      return callback(err);

    }

    _instance.file_content.tags = tags;

    return callback(null);

  });

}

// opens a file for reading
tagReader.prototype.openFile = function(callback) {

  fs.open(_instance.file_path, _instance.open_flag, function(err, file_handle) {

    if (err !== null) {

      return callback(err);

    }

    _instance.file_handle = file_handle;

    return callback(null);

  })

}

// close the file when finished
tagReader.prototype.closeFile = function(callback) {

  try {

    fs.close(_instance.file_handle, function() {

      return callback(null);

    });

  }

  catch (e) {

    return callback(e);

  }

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