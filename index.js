
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

  if (fs.existsSync(file) === false) {

    return callback(false, "File does not exist");

  }

  getRawTags(file, function(success, msg, rawTags) {

    id3.tags = processTags(rawTags);
    id3.tags.path = file;

    return callback(true, "ID3 Tag generated", id3);

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

  var pos = 0;

  while (pos < content.length - 10) {
    
    var tag_label = content.toString('ascii', pos, pos + 4);
    var tag_size = content.readUInt32BE(pos + 4);

    if (_.isUndefined(labels[tag_label]) === false) {

      var label = labels[tag_label].toLowerCase().replace(/\s/g, '_');
      var text = content.slice(pos + 10, pos + 10 + tag_size).toString('ascii').replace(/[\u0000-\u0009]|~/g, '');

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

var getRawTags = function(path, callback) {

  var functions = [];

  // open the file for reading
  functions.push(function(cb) {

    fs.open(path, 'r', function(err, file_handle) {

      if (err !== null) {

        return cb(err);

      }

      return cb(null, file_handle);

    });

  });

  // get the tag details
  functions.push(loadTagDetails);

  // get the tag data
  functions.push(loadTagData);

  // close the file
  functions.push(function(file_handle, raw_tags, cb) {

    try {

      fs.close(file_handle, function() {

        return cb(null, raw_tags);

      });

    }

    catch (e) {

      return cb(e);

    }

  });
  
  // run the functions
  async.waterfall(functions, function(err, data) {

    if (err !== null) {

      return callback(false, err);

    }

    return callback(true, "tags returned", data);

  });

}

// loads the details about the tag size etc
var loadTagDetails = function(file_handle, callback) {

  var file_data = new Buffer(10);

  fs.read(file_handle, file_data, 0, 10, 0, function(err, data) {

    if (err !== null) {

      return callback(err);

    }

    if (file_data.toString('ascii', 0, 3) !== 'ID3') {

      return callback("No ID3 Tag");

    }

    var data_size = id3Size(file_data.slice(6,10)); 
    id3.version = '2.'+file_data.readUInt8(3)+'.'+file_data.readUInt8(4);

    return callback(null, file_handle, data_size);

  });

}

// load the actual tag data
var loadTagData = function(file_handle, tag_size, callback) {

  var tag_data = new Buffer(tag_size);
  fs.read(file_handle, tag_data, 0, tag_size, 0, function(err, data) {

    if (err !== null) {

      return callback(err);

    }

    return callback(null, file_handle, tag_data);

  });

}

module.exports = {
  read: read
}