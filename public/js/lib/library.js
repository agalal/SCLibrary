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

                $('#channel_list').hide();
                scope.channels_visible = false;

                $('#scplaylist_list').hide();
                scope.scplaylists_visible = false;

                $('.playlistForm').hide();
                $('.addPlaylist').click(function(){
                    $('.playlistForm').show();
                });

                // Load song library, and channel/playlist names
                scope.loadLibrary();
                scope.loadChannels();
                scope.loadPlaylists();
                scope.loadSCPlaylists();

            },
            post: function(scope, element, attr) {

                // Set context to default option (songs)
                scope.context = 'songs';

                // Variables used for sort and search functionality
                scope.sortType = 'r.properties.created_at';
                scope.sortReverse = true;
                scope.searchTerm = '';

                // Draggable handles for the columns
                scope.colSizeable = attachColHandles();
            }
        }
    };
}]);

// Library controller
app.controller("LibraryCtlr", function($scope, $http){

    // Send a song to the player and save the next 20 songs for an autoplay queue
    $scope.playSong = function(track, element){

        var b_element = element;

        autoqueue = [];
        var i = 0;
        while (element.$$nextSibling && i < 20){
            var t = element.$$nextSibling.track;
            autoqueue.push(t);
            element = element.$$nextSibling;
            i++;
        }

        backqueue = [];
        var j = 0;
        while (b_element.$$prevSibling && j < 20){
            var t = b_element.$$prevSibling.track;
            backqueue.push(t);
            b_element = b_element.$$prevSibling;
            j++;
        }

        loadSong(track);
    }

    // Update sort variables
    $scope.updateSort = function(sortBy){
        if ($scope.sortType == sortBy)
            $scope.sortReverse = !$scope.sortReverse;
        else
            $scope.sortReverse = false;
        $scope.sortType = sortBy;
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

    // Format playlist name string
    $scope.formatName = function(name){
        if (name.length > 26)
            return (name.substring(0,26).trim() + "...");
        else
            return name;
    }

    $scope.toggleChannels = function(){
        $scope.channels_visible = !$scope.channels_visible;
        if ($scope.channels_visible)
            $('#channel_list').show();
        else
            $('#channel_list').hide();

    }

    $scope.toggleSCPlaylists = function(){
        $scope.scplaylists_visible = !$scope.scplaylists_visible;
        if ($scope.scplaylists_visible)
            $('#scplaylist_list').show();
        else
            $('#scplaylist_list').hide();

    }

    // Add a playlist to the database and hide the new playlist form
    $scope.createPlaylist = function(){
        console.log(loggedinuser);
        var url = 'http://localhost:3000/api/playlists/';
        var data = {
            name: $scope.playlistInput,
            uid: loggedinuser._id
        }
        $http.post(url, data).then(function(response){
            console.log(response);
            $scope.loadPlaylists();
        }, function(error){
            console.log(error);
        });

        $('.playlistForm').hide();
        $scope.playlistInput = '';
    }

    // Update the view with tracks from the selected playlist.
    $scope.loadPlaylist = function(playlist){
        var url = 'http://localhost:3000/api/playlists/' + playlist.p._id;
        $http.get(url).then(function(response){
                $scope.display = response.data;
                $scope.context = 'playlists';
                $scope.currPlaylist = playlist.p._id;
                $scope.buildDeleteFromPlaylistMenu(playlist);
            }, function(error){
                console.log(error);
            })
    }

    // Delete playlist with permission from the user.
    $scope.deletePlaylist = function(playlist){
        if (confirm("Are you sure you want to delete?") == true){
            var id = playlist.p._id;
            var url = 'http://localhost:3000/api/playlists/' + id;
            $http.delete(url).then(function(response){
                console.log(response);
                if ($scope.currPlaylist == id){
                    $scope.displaySongs();
                }
                $scope.loadPlaylists();
            }, function(error){
                console.log(error);
            })
        }
    }

    // Update the view with tracks from the selected playlist.
    $scope.loadSCPlaylist = function(playlist){
        var uid = loggedinuser._id;
        var url = 'http://localhost:3000/api/users/' + uid + '/scplaylists/' + playlist.p._id;
        $http.get(url).then(function(response){
                console.log(response);
                $scope.display = response.data;
                $scope.context = 'scplaylists';
            }, function(error){
                console.log(error);
            })
    }

    $scope.loadChannel = function(channel){
        var uid = loggedinuser._id;
        var cid = channel.c._id;
        var url = 'http://localhost:3000/api/users/' + uid + '/channels/' + cid;
        $http.get(url).then(function(response){
            console.log(response);
                $scope.display = response.data;
                $scope.context = 'channels';
            }, function(error){
                console.log(error);
            })
    }

    // Update the view with the user's collection
    $scope.displaySongs = function(){
        $scope.display = $scope.collection.splice(0,300);
        $scope.context = 'songs';
        $scope.currPlaylist = null;
    }

    $scope.displayQueue = function(){
        $scope.display = queue;
        $scope.context = 'queue';
        $scope.currPlaylist = null;
    }

    // Populate the list of songs
    $scope.loadLibrary = function(){
        var uid = loggedinuser._id;
        var url = 'http://localhost:3000/api/users/' + uid + '/collection/';
        $http.get(url).then(function(response){
            $scope.collection = response.data;
            $scope.displaySongs();
        }, function(error){
            console.log(error);
        });
    }

    // Populate the list of playlists
    $scope.loadPlaylists = function(){
        var uid = loggedinuser._id;
        var url = 'http://localhost:3000/api/users/' + uid + '/playlists/';
        $http.get(url).then(function(response){
            $scope.playlists = response.data;
            $scope.buildAddToPlaylistMenu(response.data);
            $scope.updateMenu();
        }, function(error){
            console.log(error);
        });
    }

    // Populate the list of playlists
    $scope.loadSCPlaylists = function(){
        var uid = loggedinuser._id;
        var url = 'http://localhost:3000/api/users/' + uid + '/scplaylists/';
        $http.get(url).then(function(response){
            $scope.scplaylists = response.data;
        }, function(error){
            console.log(error);
        });
    }

    // Populate the list of playlists
    $scope.loadChannels = function(){
        var uid = loggedinuser._id;
        var url = 'http://localhost:3000/api/users/' + uid + '/channels/';
        $http.get(url).then(function(response){
            $scope.channels = response.data;
        }, function(error){
            console.log(error);
        });
    }

    $scope.updateMenu = function(){
      // Destroy the current context menu
      $.contextMenu( 'destroy' );

      // Initialize rate track and search on menus
      $scope.buildRateTrackMenu();
      $scope.buildSearchOnMenu();

      // Create object to hold context menu items
      var items = {};

      // Include add_playlist option in every context
      items.add_playlist = {
        name: "Add to playlist...",
        items: $scope.playlist_menu
      }

      // Include delete_playlist option when in a playlist context
      if ($scope.context == 'playlists'){
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
                queue.splice(i, 1);
                $scope.display = queue.splice(i, 1);
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

      items.search_channel_on = {
        name: "Search channel on...",
        items: $scope.search_channel_menu
      }

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
          $scope.openPurchaseUrl(track);
        }
      }
      settings.selector = '.track-row[data-purchase="true"]';

      // Create the context menu
      $.contextMenu(settings);
    }

    $scope.openPurchaseUrl = function(track){
      if (getOpt('autocheck')) {
        $scope.toggleDownload({track});
      }
      var url = track.t.properties.purchase_url;
      window.open(url);
    }

    $scope.buildAddToPlaylistMenu = function(result){
        var playlist_menu = {};

        for (var i = 0; i < result.length; i++){
            var playlist = result[i];
            var next =  {
                name: playlist.p.properties.name,
                callback: function(key, opt){
                    var pid = JSON.parse($('#' + key).attr("data-playlist")).p._id;
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

    $scope.buildDeleteFromPlaylistMenu = function(playlist){
        $scope.delete_func =  function(key, opt){
            var pid = playlist.p._id;
            var tid = JSON.parse(opt.$trigger[0].dataset.track).t._id;
            var url = 'http://localhost:3000/api/playlists/' + pid + '/remove/' + tid;
            $http.delete(url).then(function(response){
                console.log(response);
                $scope.loadPlaylist(playlist);
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
      var sites = [
        { url: 'http://www.zippysharedjs.com/search/?q=',
          name: 'ZippyShare'
        },
        { url: 'https://thepiratebay.org/search/',
          name: 'thepiratebay'
        },
        { url: 'https://www.beatport.com/search?q=',
          name: 'Beatport'
        }
      ];
      var search_track_menu = {};
      var search_channel_menu = {};

      for (var i = 0; i < sites.length; i++){
        var name = sites[i].name;
        var track = {
          name: name,
          callback: function(key, opt){
            var url = sites.find(x=>x.name === key).url;
            var tags = parseForTags(JSON.parse(opt.$trigger[0].dataset.track));
            window.open(url + tags);
          }
        }
        var channel = {
          name: name,
          callback: function(key, opt){
            var url = sites.find(x=>x.name === key).url;
            var channel_name = JSON.parse(opt.$trigger[0].dataset.track).c.properties.name;
            window.open(url + channel_name);
          }

        }
        search_track_menu[name] = track;
        search_channel_menu[name] = channel;
      }

      $scope.search_track_menu = search_track_menu;
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

});

function highlightRow(track){
  $('.curr-playing').removeClass('curr-playing');
  $('*[data-id="' + track.t._id + '"]').addClass('curr-playing');
}

function updateCollection(){
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
