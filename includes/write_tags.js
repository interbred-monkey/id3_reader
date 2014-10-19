// initialise the writing of tags
var write = function(file, tags, callback) {

  // file doesn't exist
  if (fs.existsSync(file) === false) {

    return callback(false, "File does not exist");

  }

  // supplied tags are in the wrong format
  if (!_.isObject(tags)) {

    return callback(false, "Supplied tags should be an Object");

  }

  // overwrite the tags in the file
  overwriteTags(file, tags, function(success, msg) {

    return callback(success, msg);

  });

}

var updateTags = function(content, new_tags) {

  // add in the tags that are already in the file
  var pos = 0;

  while (pos < content.length - 10) {
    
    var tag_label = content.slice(pos, pos + 4).toString('UTF-8');
    var tag_size = content.readUInt32BE(pos + 4);

    if (_.isUndefined(labels[tag_label]) === false) {
    
      var parsed_label = labels[tag_label].toLowerCase().replace(/\s/g, '_');

      if (_.isUndefined(new_tags[parsed_label]) === false) {

        var value_buffer = content.slice(pos + 10, pos + 10 + tag_size);
        value_buffer.fill('');
        value_buffer.write(new_tags[parsed_label]);
        content.write(value_buffer.toString(), pos + 10, pos + 10 + tag_size);

      }

    }

    pos += (tag_size + 10);

  }

  // update the tag size
  var data_size = id3Size(content.slice(6,10));
  content.write(data_size.toString(), 6, 10);

  return content;

}

// update the file with the new tags
var overwriteTags = function(file_path, new_tags, callback) {

  // work out a buffer for the whole file
  var functions = [];

  functions.push(function(cb) {

    openFile(file_path, 'r+', function(success, file_handle) {

      if (success === false) {

        return cb("Unable to open file");

      }

      return cb(null, file_handle);

    });

  });

  functions.push(loadTagDetails);

  functions.push(function(file_handle, tag_size, version, cb) {

    loadTagData(file_handle, tag_size, version, function(err, file_handle, tag_content) {

      if (err !== null) {

        return cb(err);

      }

      var tag_buffer = updateTags(tag_content.tags, new_tags);

      return cb(null, file_handle, tag_size, tag_buffer);

    });

  });

  functions.push(function(file_handle, tag_size, tag_buffer, cb) {

    fs.write(file_handle, tag_buffer, 0, tag_size, 0, function(e, w, b) {

      if (e) {

        return cb(e);

      }

      return cb(null, file_handle, {});

    })

  });

  functions.push(closeFile);

  async.waterfall(functions, function(err, data) {

    if (err !== null) {

      return callback(false, err);

    }

    return callback(true, "Tags updated");

  });

}