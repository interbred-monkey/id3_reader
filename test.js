var id3 = require('./index.js');
var async = require('async');

//var path = '/home/munky-c/Desktop/01 - Over the Seas.mp3';
var path = '/Users/simonmudd/Desktop/06-alestorm-teror_on_the_high_seas.mp3';

var actions = [],
    header = null;

/*
actions.push(function(cb) {

  id3.read(path, function(err, data) {
    
    console.log(err, data);

    return cb(null);

  })

})
*/

actions.push(function(cb) {

  var tags = {
    artist: "Abba",
    title: "Does your mama know",
    album: "",
    genre: ""
  }

  id3.write({path: path, tags: tags}, function(err, data) {

    console.log(err, data);

    return cb(null);

  })

})

/*
actions.push(function(cb) {

  id3.read(path, function(err, data) {
    
    console.log(err, data);

    header = data;

    return cb(null);

  })

})
*/

async.series(actions, function() {

  console.log("Done");

  process.exit();

})