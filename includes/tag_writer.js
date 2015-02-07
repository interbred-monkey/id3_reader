var _           = require('underscore'),
    fs          = require('fs'),
    async       = require('async'),
    Buffer      = require('buffer').Buffer;

// include the tag config
var config      = require('../config/config.json'),
    _instance   = null;

var tagWriter = function(params, callback) {

  _instance = this;

  // keep the original stuff
  _instance.path = params.path;
  _instance.original_tag_size = params.original_size;
  _instance.tags = params.tag_buffer;
  (!_.isUndefined(params.save_path)?_instance.save_path = params.save_path:"");

  var actions = _instance.buildActions();

  async.series(actions, function(err, data) {

    if (!_.isNull(err)) {

      return callback(err);

    }

    if (Buffer.isBuffer(_instance.path) && _.isNull(_instance.save_path)) {

      return callback(null, _instance.buffer);

    }

    return callback(null);

  })

}

tagWriter.prototype = {
  file_handle: null,
  path: null,
  original_tag_size: null,
  tags: null,
  buffer: null,
  save_path: null
}

tagWriter.prototype.buildActions = function() {

  if (Buffer.isBuffer(_instance.path)) {

    _instance.buffer = _instance.path;

    var actions = [
      _instance.extractMusicBuffer,
      _instance.replaceTags
    ]

    if (!_.isNull(_instance.save_path)) {

      actions.push(_instance.writeFile);

    }

    return actions;

  }

  var actions = [
    _instance.readFile,
    _instance.extractMusicBuffer,
    _instance.replaceTags,
    _instance.writeFile
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

tagWriter.prototype.readFile = function(callback) {

  fs.readFile(_instance.path, function(err, file_data) {

    if (err) {

      return callback("Unable to open file");

    }

    _instance.buffer = file_data.slice(_instance.original_tag_size);

    return callback(null);

  })

}

tagWriter.prototype.writeFile = function(callback) {

  var output_path = (!_.isNull(_instance.save_path)?_instance.save_path:_instance.path);

  fs.writeFile(output_path, _instance.buffer, function(err, data) {

    if (err) {

      return callback('unable to write file');

    }

    return callback(null);

  })

}

tagWriter.prototype.replaceTags = function(callback) {

  _instance.buffer = Buffer.concat([_instance.tags, _instance.buffer]);

  return callback(null, _instance.buffer);

}

tagWriter.prototype.extractMusicBuffer = function(callback) {

  _instance.buffer = _instance.buffer.slice(_instance.original_tag_size);

  return callback(null);

}

module.exports = tagWriter;