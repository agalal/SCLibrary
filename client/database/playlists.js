module.exports = function(db) {

  var module = {};

  // Given a playlist name and a user id, create a playlist and assign
  // ownership to the user.
  module.createPlaylist = function(name, uid, done) {
    //TODO: Make sure playlists are not created w/ duplicate names
    db.cypher({
      query: "MATCH (u:Channel) " +
        "WHERE id(u) = {uid} " +
        "CREATE (p:Playlist {name: {playlist_name} })<-[r:OWNS]-(u) " +
        "RETURN u, r, p",
      params: {
        playlist_name: name,
        uid: parseInt(uid)
      }
    }, function(error, results) {
      if (error) {
        done(error);
      } else {
        done();
      }
    });
  }

  // Given a playlist id, remove that playlist from the database.
  module.deletePlaylist = function(pid, done) {
    db.cypher({
      query: "MATCH (p:Playlist) " +
        "WHERE id(p) = " + pid +
        " DETACH DELETE p",
      params: {
        pid: parseInt(pid)
      }
    }, function(error, results) {
      if (error) {
        done(error);
      } else {
        done();
      }
    });
  }

  // Given a track id and a playlist id, create a playlist contains track relationship.
  module.addTrackToPlaylist = function(tid, pid, done) {
    //TODO: See if we can make it so this function gives an indication of whether or not
    //      the relationship was unique.
    db.cypher({
      query: "MATCH (t:Track), (p:Playlist) " +
        "WHERE id(p) = {pid} " +
        "AND id(t) = {tid} " +
        "MERGE (p)-[r:CONTAINS]->(t) " +
        "RETURN p, r, t",
      params: {
        tid: parseInt(tid),
        pid: parseInt(pid)
      }
    }, function(error, results) {
      if (error) {
        done(error);
      } else {
        done();
      }
    });
  }

  // Given a track id and a playlist id, remove any playlist contains track relationship between them.
  module.removeTrackFromPlaylist = function(tid, pid, done) {
    var query = "MATCH (t:Track)<-[r:CONTAINS]-(p:Playlist) " +
      "WHERE id(p) = " + pid +
      " AND id(t) = " + tid +
      " DELETE r";
    db.cypher({
      query: query,
      params: {
        tid: parseInt(tid),
        pid: parseInt(pid)
      }
    }, function(error, results) {
      if (error) {
        done(error);
      } else {
        done();
      }
    });
  }

  // Given a playlist id, return the list of all tracks contained by the playlist.
  module.getPlaylist = function(uid, pid, done) {
    db.cypher({
      query: "MATCH (p:Playlist)-[:CONTAINS]->(t:Track)<-[:UPLOADED]-(c), " +
        "(u:Channel)-[r:LIKES_TRACK]->(t) " +
        "WHERE id(p) = " + pid + " " +
        "AND id(u) = " + uid + " " +
        "RETURN t, r, c",
      params: {
        id: parseInt(pid)
      }
    }, function(error, results) {
      if (error) {
        done(error);
      } else {
        done(results);
      }
    });
  }

  // Given a user, return the list of all playlists owned by the user.
  module.getPlaylists = function(uid, done) {
    db.cypher({
      query: "MATCH (c:Channel)-[:OWNS]->(p:Playlist) " +
        "WHERE id(c) = {uid} " +
        "RETURN p",
      params: {
        uid: parseInt(uid)
      }
    }, function(error, results) {
      if (error) {
        done(error);
      } else {
        done(results);
      }
    });
  }

  // Given a playlist id, return the list of all tracks contained by the playlist.
  module.getSCPlaylist = function(uid, pid, done) {
    db.cypher({
      query: "MATCH (p:SCPlaylist)-[:CONTAINS]->(t:Track)<-[:UPLOADED]-(c), (u:Channel)-[r:LIKES_TRACK]->(t) " +
        "WHERE id(p) = " + pid + " " +
        "AND id(u) = " + uid + " " +
        "RETURN t, r, c",
      params: {
        pid: parseInt(pid),
        uid: parseInt(uid)
      }
    }, function(error, results) {
      if (error) {
        done(error);
      } else {
        done(results);
      }
    });
  }

  // Given a user, return the list of all playlists owned by the user.
  module.getSCPlaylists = function(uid, done) {
    db.cypher({
      query: "MATCH (c:Channel)-[:LIKES_PLAYLIST]->(p:SCPlaylist) " +
        "WHERE id(c) = {uid} " +
        "RETURN p",
      params: {
        uid: parseInt(uid)
      }
    }, function(error, results) {
      if (error) {
        done(error);
      } else {
        done(results);
      }
    });
  }

  return module;
}
