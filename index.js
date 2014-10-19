
// include some libraries
var _       = require('underscore'),
    async   = require('async');

// include some processing libraries
var tagReader     = require('./includes/tag_reader.js'),
    tagExtractor  = require('./includes/tag_extractor.js');

// initialise the tag retrieval 
var read = function(file, callback) {

  new tagReader({file_path: file}, function(err, file_content) {

    if (err) {

      return callback(err);

    }

    var tags = new tagExtractor(file_content);

    return callback(null, tags);

  }) 

}

var write = function(params, callback) {

  var actions = [];

  actions.push(function(cb) {

    new tagReader({file_path: params.file}, function(err, file_content) {

      if (err) {

        return cb(err);

      }

      return cb(null, file_content);

    })

  })

  actions.push(function(file_content, cb) {

    new tagWriter(file_content, function(err, data) {

      if (!_.isNull(err)) {

        return cb(err);

      }

      return cb(null, data);

    })

  })

  actions.push(function(cb) {

    new tagReader({file_path: params.file}, function(err, file_content) {

      if (err) {

        return cb(err);

      }

      return cb(null, file_content);

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