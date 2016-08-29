var autoqueue = [];
var queue = [];
var backqueue = [];

var app = angular.module("Library", []);

// Library directive - html Element
app.directive("library", [function (){
    return {
        restrict: 'E',
        templateUrl: 'http://localhost:3000/views/library.html',
        scope: false,
        link: {
            pre: function(scope, element, attr) {

                $('#scplaylist_list').hide();

                $('.playlistForm').hide();
                $('.addPlaylist').click(function(){
                    $('.playlistForm').show();
                });

                // Set context to default option (library)
                scope.context = 'library';

                // Variables used for sort and search functionality
                scope.sortType = 'r.properties.created_at';
                scope.sortReverse = true;
                scope.searchTerm = '';

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

    // Update sort variables
    $scope.updateSort = function(sortBy){
      page = 1;
      offset = 0;

      if ($scope.sortType == sortBy) {
        $scope.sortReverse = !$scope.sortReverse;
      } else {
        $scope.sortReverse = false;
      }
      $scope.sortType = sortBy;

      getPage(function(tracks) {
        $scope.resetDisplay(tracks);
      });
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
    }

    $scope.resetDisplay = function(tracks){
      $scope.updateDisplay(tracks);
    }

    $scope.addToDisplay = function(tracks){
      $scope.updateDisplay($scope.display.concat(tracks));
    }

    $scope.updateMenu = function(){
      // Destroy the current context menu
      $.contextMenu( 'destroy' );

      // Initialize rate track and search on menus
      $scope.buildRateTrackMenu();
      $scope.buildSearchOnMenu();
      $scope.buildSearchChannelOnMenu();

      // Create object to hold context menu items
      var items = {};

      // Include add_playlist option in every context
      items.add_playlist = {
        name: "Add to playlist...",
        items: $scope.playlist_menu
      }

      // Include delete_playlist option when in a playlist context
      if ($scope.context == 'playlist'){
        items.delete_playlist = {
          name: "Delete from playlist",
          callback: $scope.delete_func
        };
      }

      // Include delete_queue when in queue context, add_queue when not in queue context
      if ($scope.context == 'queue'){
        items.delete_queue = {
          name: "Delete from queue",
          callback: function(key, opt){
            var track = JSON.parse(opt.$trigger[0].dataset.track);
            var i = 0;
            for (i = 0; i < queue.length; i++){
              if (track.t._id == queue[i].t._id){
                $scope.updateDisplay(queue.splice(i, 1));
                break;
              }
            }
          }
        };
      }
      else {
        items.add_queue = {
          name: "Add to Queue",
          callback: function(key, opt){
            var track = JSON.parse(opt.$trigger[0].dataset.track);
            queue.push(track);
          }
        }
      }

      // Include rate_track option in every context
      items.rate_track = {
        name: "Rate track...",
        items: $scope.rating_menu
      }

      // Include separator
      items.sep1 = "---------";

      items.search_track_on = {
        name: "Search on...",
        items: $scope.search_track_menu
      }

      // items.search_channel_on = {
      //   name: "Search channel on...",
      //   items: $scope.search_channel_menu
      // }

      // Include link to soundcloud page
      items.soundcloud_page = {
        name: "Soundcloud page",
        callback: function(key, opt){
          var track = JSON.parse(opt.$trigger[0].dataset.track);
          var url = track.t.properties.url;
          window.open(url);
        }
      }

      var settings = {
        selector: '.track-row[data-purchase="false"]',
        items: items,
        reposition: true,
        autoHide: true,
        determinePosition: function($menu){
          // Position using jQuery.ui.position
          // http://api.jqueryui.com/position/
          $menu.css('display', 'block')
            .position({ my: "right bottom", at: "left top", of: this, collision: "fit"});
        }
      };

      // Create the context menu
      $.contextMenu(settings);

      // Include link to purchase url and change selector for tracks with purchase_url
      settings.items.purchase_link = {
        name: "Download page",
        callback: function(key, opt){
          var track = JSON.parse(opt.$trigger[0].dataset.track);
          openPurchaseUrl(track);
        }
      }
      settings.selector = '.track-row[data-purchase="true"]';

      // Create the context menu
      $.contextMenu(settings);
    }

    $scope.buildAddToPlaylistMenu = function(result){
        var playlist_menu = {};

        for (var i = 0; i < result.length; i++){
            var playlist = result[i];
            var next =  {
                name: playlist.p.properties.name,
                callback: function(key, opt){
                    var pid = $('#' + key).data("id");
                    var tid = JSON.parse(opt.$trigger[0].dataset.track).t._id;
                    var url = 'http://localhost:3000/api/playlists/' + pid + '/add/' + tid;
                    $http.post(url, {}).then(function(response){
                        console.log(response);
                    }, function(error){
                        console.log(error);
                    })
                }
            }
            playlist_menu['playlist' + i] = next;
        }
        $scope.playlist_menu = playlist_menu;

    }

    $scope.buildDeleteFromPlaylistMenu = function(){
        $scope.delete_func =  function(key, opt){
            console.log("hi");
            var pid = $scope.pid;
            var tid = JSON.parse(opt.$trigger[0].dataset.track).t._id;
            var url = 'http://localhost:3000/api/playlists/' + pid + '/remove/' + tid;
            $http.delete(url).then(function(response){
                console.log(response);
                loadPlaylist(pid);
            }, function(error){
                console.log(error);
            });
        }
    }

    $scope.buildRateTrackMenu = function(){
      var rating_menu = {};

      for (var i = 0; i <= 5; i++){
          var next =  {
              name: "" + i + " stars",
              callback: function(key, opt){
                var tid = JSON.parse(opt.$trigger[0].dataset.track).t._id;
                var body = { id: loggedinuser._id, rating: key };
                var url = 'http://localhost:3000/api/tracks/' + tid + '/rate';
                $http.post(url, body).then(function(response){
                  for (var i = 0; i < $scope.display.length; i++){
                    var track = $scope.display[i];
                    if (track.t._id == tid) track.r.properties.rating = key;
                  }
                }, function(error){
                  console.log(error);
                });
              }
          }
          rating_menu[i] = next;
      }

      rating_menu[0].name = "Clear rating"
      $scope.rating_menu = rating_menu;
    }

    $scope.buildSearchOnMenu = function(){
      var search_track_menu = {};

      for (var i = 0; i < sites.length; i++){
        var name = sites[i].name;
        var track = {
          name: name,
          callback: function(key, opt){
            var url = sites.find(x=>x.name === key).url;
            var track = JSON.parse(opt.$trigger[0].dataset.track);
            searchTrackOn(track, url);
          }
        }
        search_track_menu[name] = track;
      }
      $scope.search_track_menu = search_track_menu;
    }

    $scope.buildSearchChannelOnMenu = function(){
      var search_channel_menu = {};

      for (var i = 0; i < sites.length; i++){
        var name = sites[i].name;
        var channel = {
          name: name,
          callback: function(key, opt){
            var url = sites.find(x=>x.name === key).url;
            var track = JSON.parse(opt.$trigger[0].dataset.track);
            searchChannelOn(track, url);
          }
        }
        search_channel_menu[name] = channel;
      }
      $scope.search_channel_menu = search_channel_menu;
    }

    $scope.incPlayCount = function(track){
      var tid = track.t._id;
      var body = { id: loggedinuser._id };
      var url = 'http://localhost:3000/api/tracks/' + tid + '/playcount';
      $http.post(url, body).then(function(response){
        for (var i = 0; i < $scope.display.length; i++){
          var track = $scope.display[i];
          if (track.t._id == tid) track.r.properties.play_count++;
        }
      }, function(error){
        console.log(error);
      });
    }

    $scope.toggleDownload = function(element){
      var tid = element.track.t._id;
      var body = { id: loggedinuser._id };
      var url = 'http://localhost:3000/api/tracks/' + tid + '/downloaded';
      $http.post(url, body).then(function(response){
        for (var i = 0; i < $scope.display.length; i++){
          var track = $scope.display[i];
          if (track.t._id == tid) track.r.properties.downloaded = !track.r.properties.downloaded;
        }
      }, function(error){
        console.log(error);
      });
    }

    $scope.hasPurchaseUrl = function(track){
      return track.t.properties.purchase_url !== undefined;
    }

    $scope.openPurchaseUrl = function(track){
      openPurchaseUrl(track);
    }
});

// Populate the list of songs
function loadLibrary(){
  const aScope = angular.element(document.getElementById('libraryCtlrDiv')).scope();
  aScope.context = 'library';
  page = 1;
  offset = 0;
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

function loadChannel(cid){
  const aScope = angular.element(document.getElementById('libraryCtlrDiv')).scope();
  aScope.context = 'channel';
  aScope.cid = cid;
  page = 1;
  offset = 0;
  getPage(function(tracks) {
    aScope.resetDisplay(tracks);
  });
}

// Populate the list of playlists
function loadPlaylists(){
  const aScope = angular.element(document.getElementById('libraryCtlrDiv')).scope();
  var uid = loggedinuser._id;
  var url = 'http://localhost:3000/api/users/' + uid + '/playlists/';

  $.get(url, function(data){
    buildPlaylistList(data);
    aScope.buildAddToPlaylistMenu(data);
    aScope.updateMenu();
  });
}

// Update the view with tracks from the selected playlist.
function loadPlaylist(pid){
  const aScope = angular.element(document.getElementById('libraryCtlrDiv')).scope();
  aScope.context = 'playlist';
  aScope.currPlaylist = pid;
  aScope.pid = pid;
  page = 1;
  offset = 0;
  getPage(function(tracks) {
    aScope.resetDisplay(tracks);
    aScope.buildDeleteFromPlaylistMenu();
  });
}

// Add a playlist to the database and hide the new playlist form
function createPlaylist(){
  var url = 'http://localhost:3000/api/playlists/';
  const name = $('#playlist-input').val();
  var data = {
    name: name,
    uid: loggedinuser._id
  }
  $.post(url, data, function( data ) {
    loadPlaylists();
    $('#playlist-form').hide();
    $('#playlist-input').val('');
  });
}

// Delete playlist with permission from the user.
function deletePlaylist(pid){
  console.log(pid);
  const aScope = angular.element(document.getElementById('libraryCtlrDiv')).scope();
  if (confirm("Are you sure you want to delete?") == true){
    var url = 'http://localhost:3000/api/playlists/' + pid;
    $.ajax({
      url: url,
      type: 'DELETE',
      success: function(){
        if (aScope.currPlaylist == pid){
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
  aScope.context = 'scplaylist';
  aScope.spid = spid;
  page = 1;
  offset = 0;
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

function openPurchaseUrl(track){
  const aScope = angular.element(document.getElementById('libraryCtlrDiv')).scope();
  var url = track.t.properties.purchase_url;
  if (url) {
    if (getOpt('autocheck')) {
      aScope.toggleDownload({track});
    }
    window.open(url);
  }
}

function searchTrackOn(track, url){
  let tags = parseForTags(track);
  window.open(url + tags);
}

function searchChannelOn(track, url){
  let channel_name = track.c.properties.name;
  window.open(url + channel_name);
}

function highlightRow(track){
  $('.curr-playing').removeClass('curr-playing');
  $('*[data-id="' + track.t._id + '"]').addClass('curr-playing');
}

$(document).ready(function(){
  $('#updatingMessage').hide();
})

function updateCollection(){
  $('#updatingMessage').show();
  var scuid = loggedinuser.properties.scuid
  var url = "http://localhost:3000/api/users/" + scuid + "/collection/update";

  $.post(url, function( data ) {
    location.reload();
  });
}

function parseForTags(track){
  var name = track.t.properties.name;
  var artist = track.c.properties.name;
  var search = name + " " + artist;
  return search;
}
