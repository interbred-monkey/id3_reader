# ID3 Reader

A Node.JS ID3 tag reader for audio files, simple but thats what it does.
ID3 Reader now supports the writing of tags!!

ID3 Reader is available through an installation from npm
[id3_reader](https://npmjs.org/package/id3_reader)

```
npm install id3_reader
```

#### Reading Tags
```
id3_reader.read(path_to_file, function(err, data) {
  
  console.log(err, data);

})
```
The output from the above is as follows:
```
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
  version: '2.3.0'
} 
```

#### Writing Tags
```
var params = {
  path: 'path_to_music_file',
  tags: {
    title: 'New tag title',
    artist: 'New Artist',
    album: 'New album',
    track_number: '4/10'
  }
}

id3_reader.write(params, function(err, data) {
  
  console.log(err, data);

})
```
#### Buffers
id3_reader now supports buffers, to use a buffer when reading tags use it as follows:
```
id3_reader.read(buffer, function(err, data) {
  
  console.log(err, data);

})
```
Writing tags buffer usage is as follows:
```
var params = {
  path: buffer,
  save_path: 'path_to_save_buffer_to', // optional
  tags: {
    title: 'New tag title',
    artist: 'New Artist',
    album: 'New album',
    track_number: '4/10'
  }
}

id3_reader.write(params, function(err, data) {
  
  console.log(err, data);

})
```
The `save_path` parameter is optional and if it is not supplied the buffer will be returned with the new tags. If the `save_path` is supplied the module will write the buffer to the supplied location.

## Special Thanks
A big thank you to [richardadjogah](https://github.com/richardadjogah) for helping with the writing of tags, it helped to speed up the re-write of this module exponentially.

### Third-party libraries
[async](http://github.com/caolan/async.git)  
[underscore](http://underscorejs.org)