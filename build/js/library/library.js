var app = angular.module("Library", []);

// Library directive - html Element
app.directive("library", [function (){
  return {
    templateUrl: 'http://localhost:3000/views/library.html',
  };
}]);

// jshint esversion: 6
// Set context to default option (library)
let curr_context = 'library';

$(document).arrive("#track-rows", function() {
  loadContext('library');
  attachColHandles();
});

function buildTrackRows(tracks) {
  let page = '';
  tracks.forEach(function(track, i) {
    let index = loadedTracks.length + i - limit;
    let row = "<li class='track-row' data-url";
    if (track.t.properties.purchase_url) {
      row += "='" + track.t.properties.purchase_url + "'";
    }
    row += " data-id='" + track.t._id + "'";
    row += " data-channel='" + track.c.properties.name + "'";
    row += " data-cid='" + track.c._id + "'";
    row += " data-track='" + track.t.properties.name + "'";
    row += " data-purchase='" + (track.t.properties.purchase_url !== undefined) + "'>";
    row += "<ol>";
    row += "<li class='channel clickable'>" + track.c.properties.name + "</li>";
    row += "<li class='title clickable'>" + track.t.properties.name + "</li>";
    row += "<li class='date clickable'>" + track.t.properties.created_at.substring(0, 10) + "</li>";
    row += "<li class='genre clickable'>" + track.t.properties.genre + "</li>";
    row += "<li class='duration clickable'>" + formatTime(track.t.properties.duration) + "</li>";
    row += "<li class='liked clickable'>" + track.r.properties.created_at.substring(0, 10) + "</li>";
    row += "<li class='playcount clickable' id='playcount-" + index + "'>" + track.r.properties.play_count + "</li>";
    row += "<li class='rating'>" + track.r.properties.rating + "</li>";
    // TODO fix rating
    /*
    <li class="rating" ng-click="$event.stopPropagation()"><fieldset class="stars">
    <!-- <legend>Please rate:</legend> --> <input type="radio" id="star5-0" name="rating-0"
    value="5" ng-model="track.r.properties.rating" class="ng-pristine ng-untouched ng-valid
    ng-not-empty"><label for="star5-0"></label><input type="radio" id="star4-0" name="rating-0"
    value="4" ng-model="track.r.properties.rating" class="ng-pristine ng-untouched ng-valid
    ng-not-empty"><label for="star4-0"></label><input type="radio" id="star3-0" name="rating-0"
    value="3" ng-model="track.r.properties.rating" class="ng-untouched ng-valid ng-not-empty
    ng-dirty ng-valid-parse"><label for="star3-0"></label><input type="radio" id="star2-0"
    name="rating-0" value="2" ng-model="track.r.properties.rating" class="ng-pristine
    ng-untouched ng-valid ng-not-empty"><label for="star2-0"></label><input type="radio"
    id="star1-0" name="rating-0" value="1" ng-model="track.r.properties.rating" class="ng-pristine
    ng-untouched ng-valid ng-not-empty"><label for="star1-0"></label></fieldset></li>
    */
    row += "<li class='domain'>";
    if (track.t.properties.purchase_url) {
      row += "<a onclick='openPurchaseUrl(" + track.t._id + ", \"" + track.t.properties.purchase_url + "\")'>" + track.t.properties.purchase_url_domain + "</a>";
    }
    row += "</li>";
    row += "<li class='downloaded'>";
    row += "<input name='check-" + index + "' id='check-" + index + "' type='checkbox' class='dwnld checkbox-custom'";
    if (track.r.properties.downloaded) {
      row += " checked";
    }
    row += "><label for='check-" + index + "' class='checkbox-custom-label'></label></li>";
    row += "</ol>";
    page += row;
  });
  return page;
}

var loadedTracks = [];

function resetDisplay(tracks){
  loadedTracks = tracks;
  document.getElementById('track-rows').innerHTML = buildTrackRows(tracks);
  updateMenu();
}

function addToDisplay(tracks) {
  loadedTracks = loadedTracks.concat(tracks);
  document.getElementById('track-rows').innerHTML += buildTrackRows(tracks);
  updateMenu();
}

function findTrack(tid) {
  let found = null;
  loadedTracks.some(function(track) {
    if (track.t._id === tid) {
      found = track;
      return true;
    }
  });
  return found;
}

function findTrackIndex(tid) {
  let index = null;
  loadedTracks.some(function(track, i) {
    if (track.t._id === tid) {
      index = i;
      return true;
    }
  });
  return index;
}

function formatTime(time){
  var min_sec = time / 1000 / 60;
  var minutes = Math.floor(min_sec);
  var seconds = ("00" + Math.floor((min_sec % 1) * 60)).slice(-2);
  return minutes + ":" + seconds;
}

let term = "";
$(document).on('submit', '#search-form', function() {
  loadContext('search');
});

function clearSearch() {
  term = "";
  $('#search-bar').val("");
}

function loadContext(context) {
  resetPaging();

  if (context === 'search') {
    term = $('#search-bar').val();
  } else {
    curr_context = context;
    clearSearch();
  }

  if (context === 'queue') {
    resetDisplay(queue);
  } else {
    getPage(function(tracks) {
      resetDisplay(tracks);
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

function incPlayCount(tid){
  var body = { id: loggedinuser._id };
  var url = 'http://localhost:3000/api/tracks/' + tid + '/playcount';
  $.post(url, body, function( track ) {
    const count = track.r.properties.play_count;
    const index = findTrackIndex(tid);
    $('#playcount-' + index).text(count);
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
  $.post(url, body, function( track ) {
    const downloaded = track.r.properties.downloaded;
    const index = findTrackIndex(tid);
    $('#check-' + index).prop('checked', downloaded);
  });
}

function toggleDelete(tid){
  var body = { id: loggedinuser._id };
  var url = 'http://localhost:3000/api/tracks/' + tid + '/deleted';
  $.post(url, body, function( data ) {
    $('.track-row[data-id="' + tid + '"]').hide();
  });
}

function searchTrackOn(name, url){
  var tags = parseForTags(name);
  alertify.prompt('Search for:', tags, function (resp) {
    if (resp) {
      window.open(url + resp);
    }
  });
}

function searchChannelOn(name, url){
  var tags = parseForTags(name);
  if (tags) {
    window.open(url + tags);
  }
}

function parseForTags(raw){
  const clean = raw.replace(/[^0-9a-z]/gi, ' ')
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
