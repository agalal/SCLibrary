var queue = new Queue();
//how to use: http://code.stephenmorley.org/javascript/queues/

angular.module("Library", [])
    .factory("libraryLoader", ["$http", function ($http) {
        function load(done) {
            $http.get('http://localhost:3000/api/mycollection')
                .success(function(data, status, headers, config){
                    done(null, data);
                })
                .error(function(data, status, headers, config){
                    console.log(status);
                    var libraryErr = new Error(data);
                    libraryErr.code = status;
                    done(libraryErr);
                });
        }
        return {
            load: load
        };
    }])
    .factory("playlistsLoader", ["$http", function ($http) {
        function load(done) {
            $http.get('http://localhost:3000/api/myplaylists')
                .success(function(data, status, headers, config){
                    done(null, data);
                })
                .error(function(data, status, headers, config){
                    console.log(status);
                    var playlistErr = new Error(data);
                    playlistErr.code = status;
                    done(playlistErr);
                });
        }
        return {
            load: load
        };
    }])
    .factory("playlistLoader", ["$http", function ($http) {
        function load(pid, done) {
            console.log(pid);
            var url = 'http://localhost:3000/api/playlists/' + pid;
            console.log(url);
            $http.get(url)
                .success(function(data, status, headers, config){
                    done(null, data);
                })
                .error(function(data, status, headers, config){
                    console.log(status);
                    var playlistErr = new Error(data);
                    playlistErr.code = status;
                    done(playlistErr);
                });
        }
        return {
            load: load
        };
    }])
    .directive("library", [function (){
        return {
            restrict: 'E',
            templateUrl: 'http://localhost:3000/views/library.html',
            controller: ["libraryLoader", "playlistsLoader", "playlistLoader", "$q", '$http', function (libraryLoader, playlistsLoader, playlistLoader, $q, $http) {
                var ctlr = this;

                ctlr.convertTime = function(time){
                    var min_sec = time / 1000 / 60;
                    var minutes = Math.floor(min_sec);
                    var seconds = ("00" + Math.floor((min_sec % 1) * 60)).slice(-2);
                    return minutes + ":" + seconds;
                }

                ctlr.formatDate = function(date){
                    return date.substring(0, 10);
                }

                ctlr.playSong = function(track, element){

                    queue = new Queue();
                    var i = 0;
                    while (element.$$nextSibling && i < 20){
                        var properties = element.$$nextSibling.track.t.properties;
                        var options = { 
                            scid: properties.id,
                            duration: properties.duration,
                            artwork_url: properties.artwork_url,
                            waveform_url: properties.waveform_url
                        }
                        queue.enqueue(options);
                        element = element.$$nextSibling;
                        i++;
                    }

                    var properties = track.t.properties;
                    loadSong(properties.scid, properties.duration, properties.artwork_url, properties.waveform_url);
                }

                ctlr.loadPlaylist = function(playlist){
                    playlistLoader.load(playlist.p._id, function(err, result){
                        if (err)
                            console.log(err);
                        else {
                            console.log(result);
                            ctlr.display = result;
                        }
                    })
                }

                ctlr.displaySongs = function(){
                    ctlr.display = ctlr.collection;
                }

                libraryLoader.load(function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log(result);
                        ctlr.collection = result;
                        ctlr.display = result;
                    }
                });

                playlistsLoader.load(function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log(result);
                        ctlr.playlists = result;
                    }
                });

            }],
            controllerAs: "ctlr"
        };
    }]);

