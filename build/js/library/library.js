// jshint esversion: 6
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
                loadContext('library');
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

    // Convert time from ms to MM:SS
    $scope.convertTime = function(time){
      var min_sec = time / 1000 / 60;
      var minutes = Math.floor(min_sec);
      var seconds = ("00" + Math.floor((min_sec % 1) * 60)).slice(-2);
      return minutes + ":" + seconds;
    };

    // Format date string
    $scope.formatDate = function(date){
      return date.substring(0, 10);
    };

    $scope.updateDisplay = function(tracks){
      $scope.display = tracks;
      $scope.$apply();
      updateMenu();
    };

    $scope.addToDisplay = function(tracks){
      $scope.updateDisplay($scope.display.concat(tracks));
    };

    $scope.hasPurchaseUrl = function(track){
      return track.t.properties.purchase_url !== undefined;
    };

    $scope.openPurchaseUrl = function(track){
      const tid = track.t._id;
      const url = track.t.properties.purchase_url;
      openPurchaseUrl(tid, url);
    };
});

let term = "";
$(document).on('submit', '#search-form', function() {
  loadContext('search');
});

function clearSearch() {
  term = "";
  $('#search-bar').val("");
}

function loadContext(context) {
  const aScope = angular.element(document.getElementById('libraryCtlrDiv')).scope();

  resetPaging();

  if (context === 'search') {
    term = $('#search-bar').val();
  } else {
    curr_context = context;
    clearSearch();
  }

  if (context === 'queue') {
    aScope.updateDisplay(queue);
  } else {
    getPage(function(tracks) {
      aScope.updateDisplay(tracks);
    });
  }
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

// Add a playlist to the database and hide the new playlist form
function createPlaylist(){
  var url = 'http://localhost:3000/api/playlists/';
  const name = $('#add-playlist-input').val();
  var data = {
    name: name,
    uid: loggedinuser._id
  };
  $.post(url, data, function( data ) {
    loadPlaylists();
    $('#add-playlist-input').hide();
    $('#add-playlist-input').val('');
  });
}

// Delete playlist with permission from the user.
function deletePlaylist(pid, name){
  alertify.alert("Are you sure you want to delete " + name + "?",
    // success fn
    function () {
      var url = 'http://localhost:3000/api/playlists/' + pid;
      $.ajax({
        url: url,
        type: 'DELETE',
        success: function(){
          if (curr_pid == pid){
            loadContext('library');
          }
          loadPlaylists();
          alertify.quick('danger', 'Deleted:', name);
        }
      });
    },
    // failure fn
    function () {
      alertify.quick('info', 'Delete Cancelled', '');
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
  columns.restripe();
}

function searchTrackOn(track, url){
  var tags = parseForTags(track);
  alertify.prompt('Search for:', tags, function (resp) {
    if (resp) {
      window.open(url + resp);
    }
  });
}

function searchChannelOn(track, url){
  let channel_name = track.c.properties.name;
  var tags = parseForTags(channel_name);
  if (tags) {
    window.open(url + tags);
  }
}

function parseForTags(track){
  const name = track.t.properties.name;
  const clean = name.replace(/[^0-9a-z]/gi, ' ')
                    .replace(/free download/gi,'')
                    .replace(/clip/gi,'')
                    .replace(/premiere/gi,'')
                    .replace(/preview/gi,'')
                    .replace(/out free/gi,'')
                    .replace(/exclusive/gi,'')
                    .replace(/nest hq/gi,'')
                    .replace(/original mix/gi,'')
                    .replace(/unreleased/gi,'')
                    .replace(/release/gi,'')
                    .replace(/coming soon/gi,'')
                    .replace(/nest hq/gi,'')
                    .replace(/out now/gi,'')
                    .replace(/track of the day/gi,'')
                    .replace(/\s+/g,' ');
  return clean;
}
