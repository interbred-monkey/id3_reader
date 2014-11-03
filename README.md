# ID3 Reader

A Node.JS ID3 tag reader for audio files, simple but thats what it does.
ID3 Reader now supports the writing of tags!!

ID3 Reader is available through an installation from npm
[id3_reader](https://npmjs.org/package/id3_reader)

```
npm install id3_reader
```

# Include

To use this library simply require the file like so:
```
var id3_reader = require('id3_reader');
```

# Usage

ID3 Reader is very simple to use and can be run as follows:

## Reading tags
```
id3_reader.read(path_to_music_file, function(success, msg, data) {
  
  console.log(data);

})
```
The output of the above could look something like this:
```
{ 
  version: '2.3.0',
  tags: 
   { 
     title: 'First Witness',
     artist: 'Objekt',
     album: 'Flatland,
     year: '2014',
     track_number: '7/11',
     genre: '52)Electronic',
     languages: 'eng',
     rip_date: '2014-10-24',
     ripping_tool: 'EAC',
     release_type: 'Retail',
   } 
}
```

## Writing Tags

New tags are identified by their four character frame IDs. These are listed here: http://id3.org/id3v2.3.0#Declared_ID3v2_frames

PNG files can be embedded as album art by passing a buffer containing the file to the "APIC" frame. Support for JPEGs is TBD.

```
var albumArtPath = "albumart.png";
var albumArt = fs.readFileSync(albumArtPath);
  
var tags = { 
  APIC: albumArt,
  TIT2: 'New tag title',
  TPE1: 'New Artist',
  TALB: 'New album',
  TRCK: '4/10'
}

id3_reader.write(path_to_music_file, tags, function(success, msg) {
  
  console.log(msg);

})
```

## Third-party libraries

### [async](http://github.com/caolan/async.git)
### [underscore](http://underscorejs.org)
