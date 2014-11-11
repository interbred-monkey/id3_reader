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

#### Tag list
A list of supported tags:
* audio_encryption
* attached_picture
* comments
* commercial_frame
* encryption_method_registration
* equalization
* event_timing_codes
* general_encapsulated_object
* group_identification_registration
* involved_people_list
* linked_information
* music_cd_identifier
* mpeg_location_lookup_table
* ownership_frame
* private_frame
* play_counter
* popularimeter
* position_synchronisation_frame
* recommended_buffer_size
* relative_volume_adjustment
* reverb
* synchronized_lyric_text
* synchronized_tempo_codes
* album
* bpm
* composer
* genre
* copyright_message
* date
* playlist_delay
* encoded_by
* lyricist
* file_type
* time
* content_group_description
* title
* subtitle
* initial_key
* languages
* length
* media_type
* original_album
* original_filename
* original_lyricist
* original_artist
* original_release_year
* file_owner
* artist
* band
* conductor
* interpreted_remixed_or_otherwise_modified_by
* part_of_a_set
* publisher
* track_number
* recording_dates
* internet_radio_station_name
* internet_radio_station_owner
* size
* isrc_(international_standard_recording_code)
* software_hardware_and_settings_used_for_encoding
* year
* user_defined_text_information_frame
* unique_file_identifier
* terms_of_use
* unsychronized_lyric_text_transcription
* commercial_information
* copyright_information
* official_audio_file_webpage
* official_artist_webpage
* official_audio_source_webpage
* official_internet_radio_station_homepage
* payment
* publishers_official_webpage
* user_defined_url_link_frame