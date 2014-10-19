var _           = require('underscore'),
    fs          = require('fs'),
    async       = require('async'),
    Buffer      = require('buffer').Buffer;

var _instance = null;

var tagWriter = function(params, callback) {

  _instance = this;

  _instance.tag_header = _instance.makeHeader();

  return callback(_instance.tag_header);

}

tagWriter.prototype = {
  tag_header: null,
  tag_content: null
}

tagWriter.prototype.makeHeader = function() {

  var tag_header = new Buffer(10);

  tag_header.write('ID3', 0, 3);
  tag_header.writeUInt8('0x4', 3);
  tag_header.writeUInt8('0x0', 4);
  tag_header.write('0', 5);

  return tag_header;

}

module.exports = tagWriter;