
// include some libraries
var _       = require('underscore'),
    async   = require('async');

// include some processing libraries
var tagReader     = require('./includes/tag_reader.js'),
    tagExtractor  = require('./includes/tag_extractor.js'),
    tagWriter     = require('./includes/tag_writer.js');

// initialise the tag retrieval 
var read = function(file, callback) {

  new tagReader(file, function(err, tag_buffer) {

    if (err) {

      return callback(err);

    }

    var tags = new tagExtractor(tag_buffer);

    return callback(null, tags);

  }) 

}

var write = function(params, callback) {

  var actions = [];

  actions.push(function(cb) {

    new tagReader(params.path, function(err, tag_buffer) {

      if (err) {

        return cb(err);

      }

      return cb(null, tag_buffer);

    })

  })

  actions.push(function(tag_buffer, cb) {

    var tags = new tagExtractor(tag_buffer);

     // add in the new tags to our existing tags
      for (var pt in params.tags) {

        tags.tags[pt] = params.tags[pt];

      }

      // swap the tags about
      params.tags = tags.tags;

      return cb(null);

  })

  actions.push(function(cb) {

    new tagWriter(params, function(err, data) {

      if (!_.isNull(err)) {

        return cb(err);

      }

      return cb(null, data);

    })

  })

  actions.push(function(tag_buffer, cb) {

    new tagReader(tag_buffer, function(err, tags) {

      if (err) {

        return cb(err);

      }

      return cb(null, tags);

    })

  })

  async.waterfall(actions, function(err, data) {

    if (!_.isNull(err)) {

      return callback(err);

    }

    return callback(null);

  })

}

module.exports = {
  read: read,
  write: write
}