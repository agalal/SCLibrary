module.exports = function(db) {

  var module = {};

  module.getChannels = function(uid, done) {
    db.cypher({
      query: 'MATCH (u:Channel)-[:LIKES_TRACK]->(Track)<-[:UPLOADED]-(c:Channel) ' +
        'WHERE id(u) = {uid} ' +
        'RETURN DISTINCT c ' +
        'ORDER BY LOWER(c.name)',
      params: {
        uid: parseInt(uid)
      }
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
