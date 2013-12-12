# ID3 Reader

A Node.JS ID3 tag reader for audio files, simple but thats what it does

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
     title: 'Nancy the Tavern Wench',
     artist: 'Alestorm',
     album: 'Captain Morgan\'s Revenge',
     year: '2008',
     track_number: '4/10',
     genre: '137)Heavy Metal',
     languages: 'eng',
     rip_date: '2008-02-14',
     ripping_tool: 'EAC',
     release_type: 'Retail',
     publisher: 'Napalm Records',
     media_type: 'CD >> Very High  (Lossy) [mp3]',
   } 
}
```

## Third-party libraries

### [async](http://github.com/caolan/async.git)
### [underscore](http://underscorejs.org)