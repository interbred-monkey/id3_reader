var _           = require('underscore'),
    async       = require('async'),
    Buffer      = require('buffer').Buffer;

// include the tag config
var config      = require('../config/config.json');

var tagGenerator = function(params, callback) {

  // keep the original stuff
  this.tags = params.tags;

  this.tag_content = this.makeTags();
  this.tag_header = this.makeHeader();

  var buffer = Buffer.concat([this.tag_header, this.tag_content]);

  return callback(null, buffer);

}

tagGenerator.prototype = {
  tags: null,
  tag_header: null,
  tag_content: null,
  total_size: null
}

tagGenerator.prototype.makeHeader = function() {

  var tag_header = new Buffer(10);

  tag_header.write('ID3', 0, 3);
  tag_header.writeUInt8('0x4', 3);
  tag_header.writeUInt8('0x0', 4);
  tag_header.writeUInt32BE(this.total_size, 6);

  return tag_header;

}

tagGenerator.prototype.makeTags = function() {

  var tags   = {},
      labels = _.invert(config.labels);

  delete(this.tags.version);

  for (var it in this.tags) {

    var label = it.toLowerCase().replace(/_/g, ' ');

    if (!_.isUndefined(labels[label])) {

      tags[labels[label]] = 
        (labels[label] === 'APIC'?'\u0000\u0069\u006D\u0061\u0067\u0065\u002F\u0070\u006E\u0067\u0000\u0003\u0000':'\u0000') 
        + this.tags[it];
      
      this.total_size += (labels[label] === 'APIC'?13 + 10:11) + tags[labels[label]].length;

    }

    // user defined tags
    else {

      if (_.isUndefined(tags['TXXX'])) {
        
        tags['TXXX'] = [];

      }

      tags['TXXX'].push(label + this.tags[it]);
      this.total_size += 10 + tags['TXXX'][tags['TXXX'].length - 1].length;

    }

  }

  // calculate the total size of the tags
  this.total_size = this.calculateTotalTagSize();

  var tag_buffer = new Buffer(this.total_size + 10),
      pos        = 0;

  tag_buffer.fill('');

  for (var t in tags) {

    if (t === 'TXXX') {

      for (var ttx in tags[t]) {

        var tag_size = tags[t][ttx].length;

        tag_buffer.write(t.toString('ascii'), pos, 4, 'ascii');
        tag_buffer.write(tags[t][ttx].toString('ascii'), pos + 10, pos + 10 + tag_size);
        tag_buffer.writeUInt32BE(tag_size, pos + 4);
        tag_buffer.write('\u0000\u0000', pos + 8, pos + 10);

        pos += tag_size + 10;

      }

      continue;

    }

    var tag_size = tags[t].length;

    tag_buffer.write(t.toString('ascii'), pos, 4, 'ascii');
    tag_buffer.write(tags[t].toString('ascii'), pos + 10, pos + 10 + tag_size);
    tag_buffer.writeUInt32BE(tag_size, pos + 4);
    tag_buffer.write('\u0000\u0000', pos + 8, pos + 10);

    pos += tag_size + 10;

  }

  return tag_buffer;

}

tagGenerator.prototype.calculateTotalTagSize = function() {

  //calculate new tag size, convert to special 28-bit int
  var bit_size = this.total_size.toString(2);
  var formatted_size = new Array(32);
  var appended_size = new Array(32);

  for (var i = 0; i < 32; i++) {
    if (i < (32 - bit_size.length)) {
      appended_size[i] = 0;
    }
    else {
      appended_size[i] = parseInt(bit_size[i - (32 - bit_size.length)]);
    }
  }

  var bit_pos = 0;
  for (var i = 4; i < 32; i++) {
    if (bit_pos % 8 == 0 ) {
      formatted_size[bit_pos] = 0;
      bit_pos++;
    }
    formatted_size[bit_pos] = appended_size[i];
    bit_pos++;
  }

  return parseInt(formatted_size.join(""), 2);

}

module.exports = tagGenerator;