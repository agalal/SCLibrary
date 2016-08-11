module.exports = function(db){

    var module = {};

    // Given a collection of tracks and a user, create [:LIKES] relationships
    // between each track and the user if they do not already exist, while adding
    // tracks to the database that do not yet exist.
    module.addCollection = function(user, collection, done){
        console.log("adding collection to database");
        addItems(user, collection, 0, [], done);
    };

    // Recursive helper function for addCollection.
    function addItems(user, collection, index, pids, done){
        var item = collection[index];

        module.checkExistence(user.properties.scuid, item, function(relationshipExists, error){
            if (error) {
                done(error);
            }
            //user to item relationship already exists in database; done.
            if (relationshipExists) {
                done(null, pids);
            }
            //otherwise relationship does not yet exist; create it.
            else {
                if (item.track){
                    addTrack(user, item, function(success, error){
                        if (success){
                            index++;
                            if (index < collection.length - 1) {
                                addItems(user, collection, index, pids, done);
                            } else {
                                done(null, pids);
                            }
                        } else {
                            done(error);
                        }
                    });
                }
                else {
                    addPlaylist(user, item, function(success, error){
                        if (success){
                            pids.push(item.playlist.id);
                            index++;
                            if (index < collection.length - 1) {
                                addItems(user, collection, index, pids, done);
                            } else {
                                done(null, pids);
                            }
                        }
                        else {
                            done(error);
                        }
                    });
                }
            }
        });
    }

    function addTrack(user, item, done){

        var track = item.track;

        var query = 'MATCH (u:Channel {name: {name}}) ' +
                    'MERGE (t:Track { name: {title}, duration: {duration}, scid: {tid}, ' +
                    'url: {url}, tag_list: {tag_list}, created_at: {created_at}, downloadable: {downloadable}, ';
        if (track.genre != null)
            query += 'genre: {genre}, ';
        if (track.purchase_url != null)
            query += 'purchase_url: {purchase_url}, ';
        if (track.artwork_url != null)
            query += 'artwork_url: {artwork_url}, ';
        query = query + 'waveform_url: {waveform_url} }) ' +
                    'MERGE (c:Channel { name: {channel} }) ' +
                    'ON MATCH SET c.channel_url = {channel_url}, c.avatar_url = {avatar_url}, c.scid = {uid} ' +
                    'CREATE (u)-[r1:LIKES_TRACK { created_at: {date_liked}, play_count: 0, rating: 0, downloaded: false }]->(t) ' +
                    'CREATE (c)-[r2:UPLOADED]->(t) ' +
                    'RETURN u, r1, c, r2, t';

        db.cypher({
            query: query,
            params: {
                name: user.properties.name,
                title: track.title,
                duration: track.duration,
                genre: track.genre,
                tid: track.id,
                url: track.permalink_url,
                purchase_url: track.purchase_url,
                tag_list: track.tag_list,
                artwork_url: track.artwork_url,
                created_at: track.created_at,
                downloadable: track.downloadable,
                waveform_url: track.waveform_url,
                channel: track.user.username,
                channel_url: track.user.permalink_url,
                avatar_url: track.user.avatar_url,
                uid: track.user.id,
                date_liked: item.created_at
            },
        }, function(error, results){
            if (error){
                done(false, error);
            }
            else {
                done(true);
            }
        });

    }

    module.addPlaylistTracks = function(playlists, done){

        if (playlists.length === 0){
            done(true);
        }
        else {
            var tracks = [];

            for (var i = 0; i < playlists.length; i++){
                var ptracks = playlists[i].tracks;
                for (var j = 0; j < ptracks.length; j++){
                    ptracks[j].pid = playlists[i].id;
                }
                var updatedtracks = tracks.concat(ptracks);
                tracks = updatedtracks;
            }
            addPlaylistTracksRecurse(tracks, 0, done);
        }
    };

    function addPlaylistTracksRecurse(tracks, index, done){
        var track = tracks[index];

        var query = 'MATCH (p:SCPlaylist {scid: {pid}}) ' +
                    'MERGE (t:Track { name: {title}, duration: {duration}, scid: {tid}, ' +
                    'url: {url}, tag_list: {tag_list}, created_at: {created_at}, ';
        if (track.genre != null)
            query += 'genre: {genre}, ';
        if (track.purchase_url != null)
            query += 'purchase_url: {purchase_url}, ';
        if (track.artwork_url != null)
            query += 'artwork_url: {artwork_url}, ';
        query = query + 'waveform_url: {waveform_url} }) ' +
                    'MERGE (c:Channel { name: {channel} }) ' +
                    'ON MATCH SET c.channel_url = {channel_url}, c.avatar_url = {avatar_url}, c.scid = {uid} ' +
                    'CREATE (p)-[r1:CONTAINS]->(t) ' +
                    'CREATE (c)-[r2:UPLOADED]->(t) ' +
                    'RETURN p, r1, c, r2, t';

        db.cypher({
            query: query,
            params: {
                pid: track.pid,
                title: track.title,
                duration: track.duration,
                genre: track.genre,
                tid: track.id,
                url: track.permalink_url,
                purchase_url: track.purchase_url,
                tag_list: track.tag_list,
                artwork_url: track.artwork_url,
                created_at: track.created_at,
                waveform_url: track.waveform_url,
                channel: track.user.username,
                channel_url: track.user.permalink_url,
                avatar_url: track.user.avatar_url,
                uid: track.user.id
            },
        }, function(error, results){
            if (error){
                console.log(error);
                done(false, error);
            }
            else {
                console.log(results);
                index++;
                //Is this off by 1? too baked.
                if (index < tracks.length - 1)
                    addPlaylistTracksRecurse(tracks, index, done);
                else
                    done(true);
            }
        });
    }


    function addPlaylist(user, item, done){

        var playlist = item.playlist;

        var query = 'MATCH (u:Channel {name: {name}}) ' +
                    'MERGE (p:SCPlaylist { name: {title}, scid: {scid}, ';
        if (playlist.purchase_url != null)
            query += 'purchase_url: {purchase_url}, ';
        if (playlist.artwork_url != null)
            query += 'artwork_url: {artwork_url}, ';
        query = query + 'url: {url}, created_at: {created_at} }) ' +
                    'MERGE (c:Channel { name: {channel} }) ' +
                    'ON MATCH SET c.channel_url = {channel_url}, c.avatar_url = {avatar_url}, c.scid = {uid} ' +
                    'CREATE (u)-[r1:LIKES_PLAYLIST { created_at: {date_liked}}]->(p) ' +
                    'CREATE (c)-[r2:UPLOADED]->(p) ' +
                    'RETURN u, r1, c, r2, p';

        db.cypher({
            query: query,
            params: {
                name: user.properties.name,
                title: playlist.title,
                scid: playlist.id,
                url: playlist.permalink_url,
                purchase_url: playlist.purchase_url,
                artwork_url: playlist.artwork_url,
                created_at: playlist.created_at,
                channel: playlist.user.username,
                channel_url: playlist.user.permalink_url,
                avatar_url: playlist.user.avatar_url,
                uid: playlist.user_id,
                date_liked: item.created_at
            },
        }, function(error, results){
            if (error){
                done(false, error);
            }
            else {
                done(true);
            }
        });

    }


    // Check for the existence of a [:LIKES] relationship between a channel and a track.
    // Return true if it exists, false if it does not.
    module.checkExistence = function(scuid, item, done){

        if (item.track){
            db.cypher({
                query: 'MATCH (u:Channel {scuid: {scuid} }), (t:Track {scid: {scid} } ), (u)-[:LIKES_TRACK]->(t) return u, t',
                params: {
                    scuid: scuid,
                    scid: item.track.id
                },

            }, function(error, results){
                if (error){
                    done(null, error);
                }
                else {
                    // If no match, create an entry for the user
                    if (results.length === 0) {
                        done(false);
                        //TODO: Update access token
                    }
                    else {
                        done(true);
                    }
                }
            });
        }
        else
        if (item.playlist){
            db.cypher({
                query: 'MATCH (u:Channel {scuid: {scuid} }), (p:SCPlaylist {scid: {scid} } ), (u)-[:LIKES_PLAYLIST]->(p) return u, p',
                params: {
                    scuid: scuid,
                    scid: item.playlist.id
                },

            }, function(error, results){
                if (error){
                    done(null, error);
                }
                else {
                    // If no match, create an entry for the user
                    if (results.length === 0) {
                        console.log("No relationship found.");
                        done(false);
                        //TODO: Update access token
                    }
                    else {
                        console.log("Relationship already exists.");
                        done(true);
                    }
                }
            });
        }


    };

    // Given a user, find and return their entire collection of songs, along with the channels
    // that uploaded them.
    module.getCollection = function(uid, done){
        db.cypher({
            query:  'MATCH (u:Channel), ' +
                    '(u)-[r:LIKES_TRACK]->(t)<-[:UPLOADED]-(c) ' +
                    'WHERE id(u) = ' + uid + ' ' +
                    'RETURN t, r, c ' +
                    'ORDER BY r.created_at DESC',
            params: {
                uid: parseInt(uid)
            },
        }, function(error, results){
            if (error){
                console.log(error);
                done(null, error);
            }
            else {
                // No collection found for the user
                if (results.length === 0) {
                    console.log("no collection found for this user");
                // If match found, do nothing
                } else {

                }
                done(results);
            }
        });
    };
    return module;
};
