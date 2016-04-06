// Database
var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase('http://neo4j:zomboy69@localhost:7474');

function addUser(user, done){
    // Search the database to find a match
    db.cypher({ 
        query: 'MATCH (user:Channel {name: {name}}) RETURN user',
        params: {
            name: user.username
        },
    }, function(err, results){
        if (err){
            res.json({"error":"error"});
        }
        // If no match, create an entry for the user
        if (results.length == 0) {
            console.log('User not found. Going to create user ' + user.username + '.');
            // Create an entry for the user
            var query = 'CREATE (user:Channel {name: {name}, scuid: {scuid},' +
                                    'permalink: {permalink}, avatar_url: {avatar_url},' +
                                    'country: {country} }) RETURN user';
            db.cypher({ 
                query: query,
                params: {
                    name: user.username,
                    scuid: user.id,
                    permalink: user.permalink,
                    avatar_url: user.avatar_url,
                    country: user.country
                },
            }, function(err, results){
                if (err){
                    res.json({"error":"error"});
                } else {
                    console.log("User added to database");
                    // Request the users soundcloud ID from the server
                    done();
                }
            });
        // If match found, do nothing
        } else {
            console.log("User already in database");
            done();
        }
    });
}

function addCollection(user, collection, done){
    console.log("adding collection to database");
    addTracks(user, collection, 0, done);
}

function addTracks(user, collection, index, done){
    track = collection[index];
    if (track.kind == 'track'){
        var scquery = 'MATCH (user:Channel {name: {name}}) ' + 
                    'MERGE (t:Track { name: {title}, genre: {genre}, duration: {duration}, scid: {tid}, ' +
                    'url: {url}, tag_list: {tag_list}, created_at: {created_at}, ';
        if (track.purchase_url != null)
            scquery += 'purchase_url: {purchase_url}, ';
        if (track.artwork_url != null)
            scquery += 'artwork_url: {artwork_url}, ';
        scquery = scquery + 'waveform_url: {waveform_url} }) ' +
                    'MERGE (c:Channel { name: {channel} }) ' + 
                    'ON MATCH SET c.channel_url = {channel_url}, c.avatar_url = {avatar_url}, c.scid = {uid} ' + 
                    'CREATE (user)-[r1:LIKES_TRACK]->(t) ' +
                    'CREATE (c)-[r2:UPLOADED]->(t) ' +
                    'RETURN user, r1, c, r2, t';

        db.cypher({ 
            query: scquery,
            params: {
                name: user.username,
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
        }, function(err, results){
            index++;
            console.log(results);
            if (index < collection.length - 1){
                addTracks(user, collection, index, done);
            }
            else { 
                // And forward to success page
                done();
            }
        });

    } else {
        index++;
        console.log("attempted to add playlist");
        if (index < collection.length - 1)
            addTracks(user, collection, index, done);
        else { 
            // And forward to success page
            done();
        }
    }
}


module.exports = {
    addUser: addUser,
    addCollection: addCollection
}     