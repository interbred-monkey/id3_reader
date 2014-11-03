
// include the underscore module
var _ = require('underscore');

// include the filesystem module
var fs = require('fs');

// include the async library
var async = require('async');

// include the buffer module
var Buffer = require('buffer').Buffer;

// declare our return object
var id3 = {};

var genres = [
  "Techno-Industrial", "Electronic", "Pop-Folk", "Eurodance", "Dream", "Southern Rock", "Comedy", 
  "Metal", "New Age", "Oldies", "Other", "Pop", "R&B", "Rap", "Reggae", "Rock", "Techno", 
  "Industrial", "Alternative", "Ska", "Death Metal", "Pranks", "Soundtrack", "Euro-Techno", 
  "National Folk", "Swing", "Fast Fusion", "Be-bop", "Latin", "Revival", "Celtic", "Bluegrass", 
  "Space", "Meditative", "Instrumental Pop", "Instrumental Rock", "Ethnic", "Gothic", "Darkwave", 
  "Ambient", "Trip-Hop", "Vocal", "Jazz+Funk", "Jazz Fusion", "Trance", "Classical", "Instrumental", 
  "Acid", "House", "Game", "Sound Clip", "Gospel", "Noise", "AlternRock", "Bass", "Soul", "Punk", 
  "Opera", "Chamber Music", "Sonata", "Symphony", "Booty Bass", "Primus", "Porn Groove", "Satire", 
  "Blues", "Classic Rock", "Country", "Dance", "Disco", "Funk", "Grunge", "Hip-Hop", "Jazz",
  "Cult", "Gangsta", "Top 40", "Christian Rap", "Pop/Funk", "Jungle", "Native American", "Cabaret", 
  "New Wave", "Psychadelic", "Rave", "Showtunes", "Trailer", "Lo-Fi", "Tribal", "Acid Punk", 
  "Acid Jazz", "Polka", "Retro", "Musical", "Rock & Roll", "Hard Rock", "Folk", "Folk-Rock", 
  "Avantgarde", "Gothic Rock", "Progressive Rock", "Psychedelic Rock", "Symphonic Rock", 
  "Slow Rock", "Big Band", "Chorus", "Easy Listening", "Acoustic", "Humour", "Speech", "Chanson", 
  "Slow Jam", "Club", "Tango", "Samba", "Folklore", "Ballad", "Power Ballad", "Rhythmic Soul", 
  "Freestyle", "Duet", "Punk Rock", "Drum Solo", "Accapella", "Euro-House", "Dance Hall"
]

var labels = {
  "AENC": "Audio encryption",
  "APIC": "Attached picture",
  "COMM": "Comments",
  "COMR": "Commercial frame",
  "ENCR": "Encryption method registration",
  "EQUA": "Equalization",
  "ETCO": "Event timing codes",
  "GEOB": "General encapsulated object",
  "GRID": "Group identification registration",
  "IPLS": "Involved people list",
  "LINK": "Linked information",
  "MCDI": "Music CD identifier",
  "MLLT": "MPEG location lookup table",
  "OWNE": "Ownership frame",
  "PRIV": "Private frame",
  "PCNT": "Play counter",
  "POPM": "Popularimeter",
  "POSS": "Position synchronisation frame",
  "RBUF": "Recommended buffer size",
  "RVAD": "Relative volume adjustment",
  "RVRB": "Reverb",
  "SYLT": "Synchronized lyric text",
  "SYTC": "Synchronized tempo codes",
  "TALB": "Album",
  "TBPM": "BPM",
  "TCOM": "Composer",
  "TCON": "Genre",
  "TCOP": "Copyright message",
  "TDAT": "Date",
  "TDLY": "Playlist delay",
  "TENC": "Encoded by",
  "TEXT": "Lyricist",
  "TFLT": "File type",
  "TIME": "Time",
  "TIT1": "Content group description",
  "TIT2": "Title",
  "TIT3": "Subtitle",
  "TKEY": "Initial key",
  "TLAN": "Languages",
  "TLEN": "Length",
  "TMED": "Media type",
  "TOAL": "Original album",
  "TOFN": "Original filename",
  "TOLY": "Original lyricist",
  "TOPE": "Original artist",
  "TORY": "Original release year",
  "TOWN": "File owner",
  "TPE1": "Artist",
  "TPE2": "Band",
  "TPE3": "Conductor",
  "TPE4": "Interpreted remixed or otherwise modified by",
  "TPOS": "Part of a set",
  "TPUB": "Publisher",
  "TRCK": "Track number",
  "TRDA": "Recording dates",
  "TRSN": "Internet radio station name",
  "TRSO": "Internet radio station owner",
  "TSIZ": "Size",
  "TSRC": "ISRC (international standard recording code)",
  "TSSE": "Software Hardware and settings used for encoding",
  "TYER": "Year",
  "TXXX": "User defined text information frame",
  "UFID": "Unique file identifier",
  "USER": "Terms of use",
  "USLT": "Unsychronized lyric text transcription",
  "WCOM": "Commercial information",
  "WCOP": "Copyright information",
  "WOAF": "Official audio file webpage",
  "WOAR": "Official artist webpage",
  "WOAS": "Official audio source webpage",
  "WORS": "Official internet radio station homepage",
  "WPAY": "Payment",
  "WPUB": "Publishers official webpage",
  "WXXX": "User defined URL link frame"
}

var user_tags = ["Rip date", "Ripping tool", "Release type"];

// initialise the tag retrieval 
var read = function(file, callback) {

  // file doesn't exist
  if (fs.existsSync(file) === false) {

    return callback(false, "File does not exist");

  }

  // get the tag data
  getRawData(file, function(success, msg, rawData) {

    if (success === false || _.isUndefined(rawData)) {

      return callback(false, "Unable to generate tags");

    }

    // work out the tags from the raw data
    id3.version = rawData.version;
    id3.tags = processTags(rawData.tags);
    id3.tags.path = file;

    return callback(true, "ID3 Tag generated", id3);

  });

}

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

// get the size of the tag
var id3Size = function (buffer) {

  var integer = ((buffer[0] & 0x7F) << 21 ) |
                ((buffer[1] & 0x7F) << 14) |
                ((buffer[2] & 0x7F) << 7) |
                (buffer[3] & 0x7F);

  return integer;

}

var extractUserDefinedData = function(tag_text) {

  var return_tag = {};

  for (var ut in user_tags) {

    var regex = new RegExp(user_tags[ut], 'i');

    if (tag_text.match(regex)) {

      return_tag.label = user_tags[ut].toLowerCase().replace(/\s/g, '_');
      return_tag.text = tag_text.replace(regex, '');
      break;

    }

  }

  return return_tag;

}

var processTags = function(content) {

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

    if (_.isUndefined(labels[tag_label]) === false) {

      var label = labels[tag_label].toLowerCase().replace(/\s/g, '_');
      var text = content.slice(pos + 10, pos + 10 + tag_size).toString('UTF-8').replace(/[\u0000-\u0009]|~|�/g, '');

      // is this some user defined tag?
      if (label === "user_defined_text_information_frame") {

        tag_data = extractUserDefinedData(text);
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

var updateTags = function(content, new_tags) {

  // add in the tags that are already in the file
  var temp_size = 0;

  //find the size of our new tags
  for (var key in new_tags) {
    if (new_tags.hasOwnProperty(key)) {

      //special case for album art
      //ONLY PNGS ARE SUPPORTED
      if (key == 'APIC'){
        temp_size += 13 + 10 + new_tags[key].length;
      }
      else {
        temp_size += 11 + new_tags[key].length;
      }
    }
  }

  //create new buffer to hold our new tags
  var temp_buffer = new Buffer(temp_size + 10);
  temp_buffer.fill('');

  //copy the old header
  content.copy(temp_buffer, 0, 0, 10);

  //calculate new tag size, convert to special 28-bit int
  var bit_size = temp_size.toString(2);
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

  //write the new size of all tags
  temp_buffer.writeUInt32BE(parseInt(formatted_size.join(""), 2), 6);

  var pos = 10;

  for (var key in new_tags) {

    //get frame id
    var tag_label = key.toString('ascii');

    if (_.isUndefined(labels[tag_label]) === false) {

      //write frame id
      temp_buffer.write(tag_label, pos, 4, 'ascii');

      //read our new tag
      var new_tag = '\u0000' + new_tags[key];  
      var new_tag_size = new_tag.length;     

      //add tags for embedded art. PNG MIME type is hard coded
      if (tag_label == 'APIC'){
        var pic_header = '\u0000\u0069\u006D\u0061\u0067\u0065\u002F\u0070\u006E\u0067\u0000\u0003\u0000';
        temp_buffer.write(pic_header.toString(), pos + 10, pos + 23);
        new_tag_size = new_tags[key].length + 13;
        new_tags[key].copy(temp_buffer, pos + 23, 0, new_tag_size);
        
      }
      else {
        temp_buffer.write(new_tag.toString(), pos + 10, pos + 10 + new_tag_size);
      }
      //write the new tag size
      temp_buffer.writeUInt32BE(new_tag_size, pos + 4);
      
      //set flags to null
      temp_buffer.write('\u0000\u0000', pos + 8, pos + 10);
         pos += (new_tag_size + 10);

    }
  }

    return temp_buffer;
}

var getRawData = function(file_path, callback) {

  var functions = [];

  // open the file for reading
  functions.push(function(cb) {

    openFile(file_path, function(success, file_handle) {

      cb(success, file_handle);

    });

  });

  // get the tag details
  functions.push(loadTagDetails);

  // get the tag data
  functions.push(loadTagData);

  // close the file
  functions.push(closeFile);
  
  // run the functions
  async.waterfall(functions, function(err, data) {

    if (err !== null) {

      return callback(false, err);

    }

    return callback(true, "data returned", data);

  });

}

// opens a file for reading
var openFile = function(file_path, flag, callback) {

  if (typeof flag === "function") {

    callback = flag;
    var open_flag = 'r';

  }

  else {

    open_flag = flag;

  }

  fs.open(file_path, open_flag, function(err, file_handle) {

    if (err !== null) {

      return callback(err);

    }

    return callback(null, file_handle);

  });

}

// close the file when finished
var closeFile = function(file_handle, return_ob, cb) {

  try {

    fs.close(file_handle, function() {

      return cb(null, return_ob);

    });

  }

  catch (e) {

    return cb(e);

  }

}

// loads the details about the tag size etc
var loadTagDetails = function(file_handle, cb) {

  var file_data = new Buffer(10);

  fs.read(file_handle, file_data, 0, 10, 0, function(err, data) {

    if (err !== null) {

      return cb(err);

    }

    if (file_data.slice(0, 3).toString() !== 'ID3') {

      return cb("No ID3 Tag");

    }

    var data_size = id3Size(file_data.slice(6,10)); 
    var version = '2.'+file_data.readUInt8(3)+'.'+file_data.readUInt8(4);

    return cb(null, file_handle, data_size, version);

  });

}

// load the actual tag data
var loadTagData = function(file_handle, tag_size, version, cb) {

  var tag_data = new Buffer(tag_size);
  fs.read(file_handle, tag_data, 0, tag_size, 0, function(err, data) {

    if (err !== null) {

      return cb(err);

    }

    var return_ob = {
      version: version,
      tags: tag_data
    }

    return cb(null, file_handle, return_ob);

  });

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

    //new writing algorithm to account for new tags that are larger/smaller
    var full_mp3 = fs.readFileSync(file_path);
    var mp3_length = full_mp3.length - tag_size;
    var mp3_buffer = new Buffer(mp3_length);
    full_mp3.copy(mp3_buffer, 0, tag_size);
    fs.unlinkSync(file_path);
    fs.appendFileSync(file_path, tag_buffer);
    fs.appendFileSync(file_path, mp3_buffer);
  });

  functions.push(closeFile);

  async.waterfall(functions, function(err, data) {

    if (err !== null) {

      return callback(false, err);

    }

    return callback(true, "Tags updated");

  });

}

module.exports = {
  read: read,
  write: write
}
