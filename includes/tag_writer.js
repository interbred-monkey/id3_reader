var _           = require('underscore'),
    fs          = require('fs'),
    async       = require('async'),
    Buffer      = require('buffer').Buffer;

// include the tag config
var config      = require('../config/config.json');

var tagWriter = function(params, callback) {

  // keep the original stuff
  this.path = params.path;
  this.original_tag_size = params.original_size;
  this.tags = params.tag_buffer;
  (!_.isUndefined(params.save_path)?this.save_path = params.save_path:"");

  var actions = this.buildActions();

  async.series(actions, function(err, data) {

    if (!_.isNull(err)) {

      return callback(err);

    }

    if (Buffer.isBuffer(this.path) && _.isNull(this.save_path)) {

      return callback(null, this.buffer);

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
    var _this = this;

  if (Buffer.isBuffer(this.path)) {

    this.buffer = this.path;

    var actions = [
      this.extractMusicBuffer.bind(this),
      this.replaceTags.bind(this)
    ]

    if (!_.isNull(this.save_path)) {

      actions.push(this.writeFile);

    }

    return actions;

  }

  var actions = [
    this.readFile.bind(this),
    this.extractMusicBuffer.bind(this),
    this.replaceTags.bind(this),
    this.writeFile.bind(this)
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

tagWriter.prototype.readFile = function(callback) {
    var _this = this;

  fs.readFile(this.path, function(err, file_data) {

    if (err) {

      return callback("Unable to open file");

    }

    _this.buffer = file_data.slice(_this.original_tag_size);

    return callback(null);

  })

}

tagWriter.prototype.writeFile = function(callback) {

    var output_path = (!_.isNull(this.save_path)?this.save_path:this.path);

    fs.writeFile(output_path, this.buffer, function (err, data) {

    if (err) {

      return callback('unable to write file');

    }

    return callback(null);

  })

}

tagWriter.prototype.replaceTags = function(callback) {
    this.buffer = Buffer.concat([this.tags, this.buffer]);

    return callback(null, this.buffer);

}

tagWriter.prototype.extractMusicBuffer = function(callback) {

  this.buffer = this.buffer.slice(this.original_tag_size);

  return callback(null);

}

module.exports = tagWriter;