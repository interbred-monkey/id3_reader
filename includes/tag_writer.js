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
  _instance.tags = params.tags;

  _instance.tag_content = _instance.makeTags();
  _instance.tag_header = _instance.makeHeader();

  var buffer = Buffer.concat([_instance.tag_header, _instance.tag_content]);

  return callback(null, buffer);

}

tagWriter.prototype = {
  path: null,
  original_tag_size: null,
  tags: null,
  tag_header: null,
  tag_content: null,
  total_size: null
}

tagWriter.prototype.loadMusic = function() {


}

module.exports = tagWriter;