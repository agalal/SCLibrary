var requestify = require('requestify');
var request = require('request');
var config = require('../config.js');

var database = require('./database.js');

// Get requests to soundcloud API
function getRequest(href, done){
  var options = {
    url: href,
    method: 'GET'
  }
  request(options, function(error, message, object){
    if (error){
      done(null, error);
    } else {
      var json = JSON.parse(object);
      done(json);
    }
  });
}

// Given a user id, get a user from soundcloud.
function getUser(uid, done){
  var href = "http://api.soundcloud.com/users/" + uid + "?client_id=" + config.auth.client_id;
  getRequest(href, done);
}

/* Get a particular resource of a user.
*  Options include:
*     tracks, playlists, followings, followers, comments, favorites, groups, web-profiles
*/
function getUserResource(uid, resource, done){
  var href = "http://api.soundcloud.com/users/" + uid + "/" + resource + "?client_id=" + config.auth.client_id;
  getRequest(href, done);
}

// Given a user, get their collection (up to the last time we grabbed their collection)
function getCollection(user, done){
  var href = 'https://api-v2.soundcloud.com/users/' + user.id + '/likes?client_id=' + config.auth.client_id + '&linked_partitioning=1&limit=200';
  getCollectionRecurse(user, [], href, done);
}

// Recursive helper function for getCollection
function getCollectionRecurse(user, collection, next_href, done){
  getRequest(next_href, function(response){
    // Update our collection array
    var updatedCollection = collection.concat(response.collection);
    // Check if the response has a next_href
    if (response.next_href){
      var href = response.next_href + '&client_id=' + config.auth.client_id;
      // Make sure the first track doesn't already have an existing relationship with the user before continuing
      // This is so that we don't make unnecessary API calls
      // TODO: fix possible glitch - if user unlikes/relikes a track, we may stop adding tracks to the collection prematurely
      database.checkExistence(user.id, response.collection[0], function(found, error){
        if (error) {
          done(null, error);
        } else if (found) {
          done(updatedCollection);
        } else {
          getCollectionRecurse(user, updatedCollection, href, done);
        }
      });
    } else {
      console.log("done grabbing collection");
      done(updatedCollection);
    }
  });
}

// Given a list of playlist IDs, get those playlists and their tracks
function getPlaylists(pids, done){
  if (pids.length > 0) {
    getPlaylistsRecurse(pids, [], 0, done);
  } else {
    done([]);
  }
}

// Recursive helper function for getPlaylists
function getPlaylistsRecurse(pids, playlists, index, done){
  var href = "http://api-v2.soundcloud.com/playlists/" + pids[index].id + "?client_id=" + config.auth.client_id;
  getRequest(href, function(playlist, error){
    if (error){
      console.log(error);
      done(null, error);
    } else {
      // Sometimes the api-v2 playlist endpoint's tracks object leaves some tracks without most of the metadata, other than the id.
      // We must fill in the missing data with a second API call.
      var tracks = playlist.tracks;
      // Make an array to store the complete track objects
      var complete_tracks = [];
      // Make another array to store the ids of the tracks we need to fill in
      var incomplete_track_ids = [];
      // Loop through the playlist's tracks and fill the arrays.
      for (var i = 0; i < tracks.length; i++){
        // If the user property is missing, so are the rest of them.
        if (!tracks[i].user) {
          incomplete_track_ids.push(tracks[i].id);
        } else {

          complete_tracks.push(tracks[i]);
        }
      }
      // Get the incomplete tracks with another API call
      getTracksByID(incomplete_track_ids, function(more_tracks){
        playlist.tracks = complete_tracks.concat(more_tracks);
        // Give the playlist it's date_liked for when we add these tracks to the database
        playlist.date_liked = pids[index].date_liked;
        // Push the playlist onto the array of playlists
        playlists.push(playlist);
        // Increment the index and check if we've reached the end of the recursion.
        index++;
        if (index < pids.length) {
          getPlaylistsRecurse(pids, playlists, index, done);
        } else {
          console.log("done grabbing playlists");
          done(playlists);
        }
      });
    }
  });
}

// Given a list of track IDs, get those tracks from the soundcloud API
function getTracksByID(tids, done){
  if (tids.length == 0){
    // Immediately return if there are no incomplete tracks.
    done([]);
  } else {
    // Otherwise, build the url and make the request.
    var id_string = "";
    for (var i = 0; i < tids.length; i++){
      if (i == 0){
        id_string += tids[i];
      } else {
        id_string += "%2C" + tids[i];
      }
    }
    var href = "https://api-v2.soundcloud.com/tracks?ids=" + id_string + "&client_id=" + config.auth.client_id;
    getRequest(href, done);
  }
}

// Given a
function getTrack(tid, done){
  var href = "http://api.soundcloud.com/tracks/" + tid + "?client_id=" + config.auth.client_id;
  getRequest(href, done);
}

function getPlaylist(pid, done){
  var href = "http://api-v2.soundcloud.com/playlists/" + pid + "?client_id=" + config.auth.client_id;
  getRequest(href, done);
}

//TODO: change this to getSCUIDFromUsername
function getUserFromUsername(username, done){
  var url = "http://soundcloud.com/" + username;
  var href = "http://api.soundcloud.com/resolve?url=" + url + "&client_id=" + config.auth.client_id;
  getRequest(href, done)
}

module.exports = {
    getRequest: getRequest,
    getCollection: getCollection,
    getUser: getUser,
    getUserResource: getUserResource,
    getTrack: getTrack,
    getPlaylist: getPlaylist,
    getPlaylists: getPlaylists,
    getUserFromUsername: getUserFromUsername
}
