var id3 = require('./index.js');
var async = require('async');

var path = '/home/munky-c/Desktop/01 Getaway.mp3';

var actions = [];

actions.push(function(cb) {

  id3.read(path, function(err, msg, data) {
    
    console.log(err, data);

    return cb(null);

  })

})

/*
actions.push(function(cb) {

  var tags = {
    artist: "Abba",
    title: "Does your mama know",
    album: "",
    genre: ""
  }

  id3.write(path, tags, function(err, msg, data) {
    
    console.log(err, data);

    return cb(null);

  })

})

actions.push(function(cb) {

  id3.read(path, function(err, msg, data) {
    
    console.log(err, data);

    return cb(null);

  })

})
*/
async.series(actions, function() {

  process.exit();

})