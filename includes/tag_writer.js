var _           = require('underscore'),
    fs          = require('fs'),
    async       = require('async'),
    Buffer      = require('buffer').Buffer;

// include the tag config
var config      = require('./config/config.json'),
    _instance   = null;

var tagWriter = function(params, callback) {

  _instance = this;

  // keep the original stuff
  _instance.path = params.path;
  _instance.original_tag_size = params.original_size;
  _instance.tags = params.tag_buffer;
  (!_.isUndefined(params.save_path)?_instance.save_path = params.save_path:"");

  var actions = _instance.buildActions();

  async.series(actions, )
  return callback(null, null);

}

tagWriter.prototype = {
  file_handle: null,
  path: null,
  original_tag_size: null,
  tags: null,
  buffer: null,
  save_path: null
}

tagWriter.prototype.buildActions = function(params) {

  if (Buffer.isBuffer(_instance.path)) {

    _instance.buffer = _instance.path;

    var actions = [
      _instance.replaceTags
    ]

    if (!_.isNull(_instance.save_path)) {

      actions.push(_instance.writeFile);

    }

    return actions;

  }

  // read the buffer from a file
  _instance.file_path = params;

  var actions = [
    _instance.openFile,
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

  return actions;

}

tagWriter.prototype.loadMusic = function() {


}

module.exports = tagWriter;