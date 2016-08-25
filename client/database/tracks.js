module.exports = function(db) {

  var module = {};

  // Given a user, find and return their entire collection of songs, along with the channels
  // that uploaded them.
  module.getTrackPage = function(options, done) {
    const context = options.context;
    const sort = options.sort;
    const reverse = options.reverse;

    let query = "";
    query += 'MATCH (u:Channel)-[r:LIKES_TRACK]->(t)<-[:UPLOADED]-(c:Channel) ';
    if (context == 'playlist') query += ', (p:Playlist)-[:CONTAINS]->(t) ';
    else if (context == 'scplaylist') query += ', (s:SCPlaylist)-[:CONTAINS]->(t) ';
    query += 'WHERE id(u) = {uid} ';
    if (context == 'channel') query += 'AND id(c) = {cid} ';
    else if (context == 'playlist') query += 'AND id(p) = {pid} ';
    else if (context == 'scplaylist') query += 'AND id(s) = {spid} ';
    query += 'RETURN t, r, c ' +
             'ORDER BY ' + sort + ' ' + reverse + ' ' +
             'SKIP {offset} ' +
             'LIMIT {limit}';

    db.cypher({
      query: query,
      params: {
        uid: options.uid,
        cid: options.cid,
        pid: options.pid,
        spid: options.spid,
        offset: options.offset,
        limit: options.limit
      },
    },
    function(error, results) {
      if (error) {
        console.log(error);
        done(null, error);
      } else {
        done(results);
      }
    });
  }

  module.getTrack = function(id, done) {
    db.cypher({
      query: 'MATCH (n:Track) ' +
        'WHERE id(n) = ' + parseInt(id) + ' ' +
        'RETURN n'
    }, function(error, results) {
      if (error) {
        done(null, error);
      } else {
        done(results);
      }
    });
  }

  module.rateTrack = function(tid, uid, rating, done) {
    db.cypher({
      query: 'MATCH (u:Channel)-[r:LIKES_TRACK]->(t:Track) ' +
        'WHERE id(t) = ' + parseInt(tid) + ' ' +
        'AND id(u) = ' + parseInt(uid) + ' ' +
        'SET r.rating = ' + parseInt(rating) + ' ' +
        'RETURN r'
    }, function(error, results) {
      if (error) {
        done(null, error);
      } else {
        done(results);
      }
    });
  }

  module.incPlayCount = function(tid, uid, done) {
    db.cypher({
      query: 'MATCH (u:Channel)-[r:LIKES_TRACK]->(t:Track) ' +
        'WHERE id(t) = ' + parseInt(tid) + ' ' +
        'AND id(u) = ' + parseInt(uid) + ' ' +
        'SET r.play_count = r.play_count + 1 ' +
        'RETURN r'
    }, function(error, results) {
      if (error) {
        done(null, error);
      } else {
        done(results);
      }
    });
  }

  module.toggleDLStatus = function(tid, uid, done) {
    db.cypher({
      query: 'MATCH (u:Channel)-[r:LIKES_TRACK]->(t:Track) ' +
        'WHERE id(t) = ' + parseInt(tid) + ' ' +
        'AND id(u) = ' + parseInt(uid) + ' ' +
        'SET r.downloaded = not(r.downloaded) ' +
        'RETURN r'
    }, function(error, results) {
      if (error) {
        done(null, error);
      } else {
        done(results);
      }
    });
  }

  return module;

}
