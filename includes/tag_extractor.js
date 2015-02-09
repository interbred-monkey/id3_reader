
// include some libraries
var _       = require('underscore'),
    fs      = require('fs'),
    async   = require('async'),
    Buffer  = require('buffer').Buffer;

// include the tag config
var config      = require('../config/config.json'),
    _instance   = null;

var tagExtractor = function(tag_data, callback) {

  _instance = this;

  var tags = _instance.processTags(tag_data.tags);
  tags.version = tag_data.version;
  tag_data = tags;

  return tag_data;

}

tagExtractor.prototype.getUserData = function(tag_text) {

  var return_tag = {};

  for (var cut in config.user_tags) {

    var regex = new RegExp(config.user_tags[cut], 'i');

    if (tag_text.match(regex)) {

      return_tag.label = config.user_tags[cut].toLowerCase().replace(/\s/g, '_');
      return_tag.text = tag_text.replace(regex, '');
      break;

    }

  }

  return return_tag;

}

tagExtractor.prototype.processTags = function(content) {

  var tags = {
    artist: "unknown",
    title: "unknown",
    album: "unknown",
    genre: "unknown"
  }

  var pos = 10;

  while (pos < content.length - 10) {
    
    var tag_size = content.readUInt32BE(pos + 4);
    var tag_label = content.slice(pos, pos + 4).toString('ascii');

    if (_.isUndefined(config.labels[tag_label]) === false) {

      var label = config.labels[tag_label].toLowerCase().replace(/\s/g, '_');
      var text = content.slice(pos + 10, pos + 10 + tag_size).toString('UTF-8').replace(/[\u0000-\u0009]|~|�/g, '');

      // is this some user defined tag?
      if (label === "user_defined_text_information_frame") {

        tag_data = _instance.getUserData(text);
        label = tag_data.label;
        text = tag_data.text;

      }

      // if we have something in the text then put it in
      if (!_.isUndefined(label) && !_.isUndefined(text) && text !== "") {

        tags[label] = text;

      }

    }

    pos += (tag_size + 10);

  }

  return tags;

}

module.exports = tagExtractor;