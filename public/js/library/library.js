// Set context to default option (library)
let curr_context = 'library';

var app = angular.module("Library", []);

// Library directive - html Element
app.directive("library", [function (){
    return {
        restrict: 'E',
        templateUrl: 'http://localhost:3000/views/library.html',
        scope: false,
        link: {
            pre: function(scope, element, attr) {

                // Load song library, and channel/playlist names
                loadLibrary();
                loadChannels();
                loadPlaylists();
                loadSCPlaylists();

            },
            post: function(scope, element, attr) {
                // Draggable handles for the columns
                scope.colSizeable = attachColHandles();
            }
        }
    };
}]);

// Library controller
app.controller("LibraryCtlr", function($scope, $http){

    $scope.playSong = function(track, element){
        trackClickListener(track, element)
    }

    // Convert time from ms to MM:SS
    $scope.convertTime = function(time){
      var min_sec = time / 1000 / 60;
      var minutes = Math.floor(min_sec);
      var seconds = ("00" + Math.floor((min_sec % 1) * 60)).slice(-2);
      return minutes + ":" + seconds;
    }

    // Format date string
    $scope.formatDate = function(date){
      return date.substring(0, 10);
    }

    $scope.updateDisplay = function(tracks){
      $scope.display = tracks;
      $scope.$apply();
      updateMenu();
    }

    $scope.resetDisplay = function(tracks){
      $scope.updateDisplay(tracks);
    }

    $scope.addToDisplay = function(tracks){
      $scope.updateDisplay($scope.display.concat(tracks));
    }

    $scope.hasPurchaseUrl = function(track){
      return track.t.properties.purchase_url !== undefined;
    }

    $scope.openPurchaseUrl = function(track){
      const tid = track.t._id;
      const url = track.t.properties.purchase_url;
      openPurchaseUrl(tid, url);
    }
});

let term = "";
$(document).on('submit', '#search-form', loadSearch);

function clearSearch() {
  term = "";
  $('#search-bar').val("");
}

function loadSearch() {
  const aScope = angular.element(document.getElementById('libraryCtlrDiv')).scope();
  resetPaging();
  term = $('#search-bar').val();
  getPage(function(tracks) {
    aScope.resetDisplay(tracks);
  });
}

// Populate the list of songs
function loadLibrary(){
  const aScope = angular.element(document.getElementById('libraryCtlrDiv')).scope();
  curr_context = 'library';
  resetPaging();
  clearSearch();
  getPage(function(tracks) {
    aScope.resetDisplay(tracks);
  });
}

// Populate the list of playlists
function loadChannels(){
  var uid = loggedinuser._id;
  var url = 'http://localhost:3000/api/users/' + uid + '/channels/';
  $.get(url, function(data) {
    buildChannelList(data);
  });
}

let curr_pid, curr_cid, curr_spid;


function loadChannel(cid){
  const aScope = angular.element(document.getElementById('libraryCtlrDiv')).scope();
  curr_context = 'channel';
  curr_cid = cid;
  resetPaging();
  clearSearch();
  getPage(function(tracks) {
    aScope.resetDisplay(tracks);
  });
}

// Populate the list of playlists
function loadPlaylists(){
  var uid = loggedinuser._id;
  var url = 'http://localhost:3000/api/users/' + uid + '/playlists/';

  $.get(url, function(data){
    buildPlaylistList(data);
    buildAddToPlaylistMenu(data);
    updateMenu();
  });
}

// Update the view with tracks from the selected playlist.
function loadPlaylist(pid){
  const aScope = angular.element(document.getElementById('libraryCtlrDiv')).scope();
  curr_context = 'playlist';
  curr_pid = pid;
  resetPaging();
  clearSearch();
  getPage(function(tracks) {
    aScope.resetDisplay(tracks);
  });
}

// Add a playlist to the database and hide the new playlist form
function createPlaylist(){
  var url = 'http://localhost:3000/api/playlists/';
  const name = $('#add-playlist-input').val();
  var data = {
    name: name,
    uid: loggedinuser._id
  }
  $.post(url, data, function( data ) {
    loadPlaylists();
    $('#add-playlist-input').hide();
    $('#add-playlist-input').val('');
  });
}

// Delete playlist with permission from the user.
function deletePlaylist(pid){
  if (confirm("Are you sure you want to delete?") == true){
    var url = 'http://localhost:3000/api/playlists/' + pid;
    $.ajax({
      url: url,
      type: 'DELETE',
      success: function(){
        if (curr_pid == pid){
          loadLibrary();
        }
        loadPlaylists();
      }
    });
  }
}

// Update the view with tracks from the selected playlist.
function loadSCPlaylist(spid){
  const aScope = angular.element(document.getElementById('libraryCtlrDiv')).scope();
  curr_context = 'scplaylist';
  curr_spid = spid;
  resetPaging();
  clearSearch();
  getPage(function(tracks) {
    aScope.resetDisplay(tracks);
  });
}

// Populate the list of playlists
function loadSCPlaylists(){
  var uid = loggedinuser._id;
  var url = 'http://localhost:3000/api/users/' + uid + '/scplaylists/';
  $.get(url, function(data){
    buildSCPlaylistList(data);
  });
}

function incPlayCount(track){
  var tid = track.t._id;
  var body = { id: loggedinuser._id };
  var url = 'http://localhost:3000/api/tracks/' + tid + '/playcount';
  $.post(url, body, function( data ) {
    const aScope = angular.element(document.getElementById('libraryCtlrDiv')).scope();
    for (var i = 0; i < aScope.display.length; i++){
      var track = aScope.display[i];
      if (track.t._id == tid) {
        track.r.properties.play_count++;
        aScope.$apply();
      }
    }
  });
}

$(document).on('change', '.stars > input', function() {
  const tid = $(this).parent().parent().parent().parent().data('id');
  const rating = $(this).val();
  rateTrack(tid, rating);
});

function rateTrack(tid, rating){
  var body = { id: loggedinuser._id, rating: rating };
  var url = 'http://localhost:3000/api/tracks/' + tid + '/rate';
  $.post(url, body, function( data ) {
    // Do nothing
  });
}

function openPurchaseUrl(tid, url){
  if (url) {
    if (getOpt('autocheck')) {
      toggleDownload(tid);
    }
    window.open(url);
  }
}

$(document).on('change', '.downloaded > input', function() {
  const tid = $(this).parent().parent().parent().data('id');
  toggleDownload(tid);
});

function toggleDownload(tid){
  var body = { id: loggedinuser._id };
  var url = 'http://localhost:3000/api/tracks/' + tid + '/downloaded';
  $.post(url, body, function( data ) {
    const aScope = angular.element(document.getElementById('libraryCtlrDiv')).scope();
    for (var i = 0; i < aScope.display.length; i++){
      var track = aScope.display[i];
      if (track.t._id == tid) {
        track.r.properties.downloaded = !track.r.properties.downloaded;
        aScope.$apply();
      }
    }
  });
}

function toggleDelete(tid){
  var body = { id: loggedinuser._id };
  var url = 'http://localhost:3000/api/tracks/' + tid + '/deleted';
  $.post(url, body, function( data ) {
    $('.track-row[data-id="' + tid + '"]').hide();
  });
}

function searchTrackOn(track, url){
  let tags = parseForTags(track);
  window.open(url + tags);
}

function searchChannelOn(track, url){
  let channel_name = track.c.properties.name;
  window.open(url + channel_name);
}

function parseForTags(track){
  var name = track.t.properties.name;
  var artist = track.c.properties.name;
  var search = name + " " + artist;
  return search;
}
