var password_hash = require('../database/passhash.js')();


module.exports = function(db) {
  const util = require('util');

  var module = {};

  module.create = function(username, password, sc_account, done) {
    //Check if account already exists
    db.cypher({
      query: 'MATCH (a:Account {username:{name} }) ' +
        'RETURN a',
      params: {
        name: username
      }
    }, function(error, results) {
      if (error) {
        done(null, error);
      } else {
        if (results.length === 0) {
          //Account does not exist, create a new one
          password = password_hash.hashPass(password, function (hash) {
            db.cypher({
              query: 'CREATE (a:Account {username:{name}, password:{pw}, type:"user", approved:false })-[:REQUESTS]->' +
                '(r:Request {username:{sc_name}, complete:false}) ' +
                'RETURN a, r',
              params: {
                name: username,
                pw: hash,
                sc_name: sc_account
              }
            }, function(error, results) {
              if (error) {
                done(null, error);
              } else {
                //Account/Request was successfully created
                done(true);
              }
            });
          });

        } else {
          //Account already exists
          done(false);
        }
      }
    });
  };

  module.login = function(username, password, done) {
    db.cypher({
      query: 'MATCH (a:Account {username:{name}}) ' +
        'RETURN a',
      params: {
        name: username,
      }
    }, function(error, response) {
      if (error) {
        console.error(error);
        done(null, error);
      } else {

        var dbPass = response[0].a.properties.password;


        // check password_hash
        password_hash.verifyPass(password, dbPass, function (success) {
          if (success) {
            // hashed pass matched db password hash
            db.cypher({
              query: 'MATCH (a:Account {username:{name}})-[:CONNECTED_TO]->(u:Channel) ' +
                'RETURN u',
              params: {
                name: username,
                pw: password
              }
            }, function(error, users) {

              if (error) {
                done(null, error);
              } else {
                var results = {
                  account: response[0],
                  users: users
                };
                //Account was successfully created
                done(results);
              }
            });
          } else {
            // didn't match, but no error
          }
        });


      }
    });
  };

  module.getAccounts = function(done) {
    db.cypher({
      query: 'MATCH (a:Account) ' +
        'RETURN a'
    }, function(error, results) {
      if (error) {
        done(null, error);
      } else {
        //Accounts retrieved
        done(results);
      }
    });
  };

  module.getRequests = function(done) {
    db.cypher({
      query: 'MATCH (a:Account)-[:REQUESTS]->(r:Request) ' +
        'RETURN a, r'
    }, function(error, results) {
      if (error) {
        done(null, error);
      } else {
        //Requests retrieved
        done(results);
      }
    });
  };

  module.approveAccount = function(aid, done) {
    console.log(aid);
    db.cypher({
      query: 'MATCH (a:Account) ' +
        'WHERE id(a) = {id} ' +
        'SET a.approved = true ' +
        'RETURN a',
      params: {
        id: parseInt(aid)
      }
    }, function(error, results) {
      if (error) {
        console.log(error);
        done(null, error);
      } else {
        //Account approved
        done(results);
      }
    });
  };

  module.denyAccount = function(aid, done) {
    db.cypher({
      query: 'MATCH (a:Account) ' +
        'WHERE id(a) = {id} ' +
        'SET a.approved = false ' +
        'RETURN a',
      params: {
        id: parseInt(aid)
      }
    }, function(error, results) {
      if (error) {
        done(null, error);
      } else {
        //Account denied
        done(results);
      }
    });
  };

  module.approveRequest = function(aid, rid, uid, done) {
    db.cypher({
      query: 'MATCH (r:Request) ' +
        'WHERE id(r) = {rid} ' +
        'SET r.complete = true ' +
        'RETURN r',
      params: {
        rid: parseInt(rid)
      }
    }, function(error, results) {
      if (error) {
        done(null, error);
      } else {
        db.cypher({
          query: 'MATCH (a:Account), (u:Channel) ' +
            'WHERE id(u) = {uid} ' +
            'AND id(a) = {aid} ' +
            'CREATE (a)-[r:CONNECTED_TO]->(u) ' +
            'RETURN a, r, u',
          params: {
            uid: parseInt(uid),
            aid: parseInt(aid)
          }
        }, function(error, results) {
          if (error) {
            done(null, error);
          } else {
            //Request approved
            done(results);
          }
        });
      }
    });
  };

  module.getRequest = function(rid, done) {
    db.cypher({
      query: 'MATCH (r:Request) ' +
        'WHERE id(r) = {id} ' +
        'RETURN r',
      params: {
        id: parseInt(rid)
      }
    }, function(error, results) {
      if (error) {
        done(null, error);
      } else {
        done(results);
      }
    });
  };

  module.getConnectedChannels = function(aid, done) {
    db.cypher({
      query: 'MATCH (a:Account)-[:CONNECTED_TO]->(c:Channel)  ' +
        'WHERE id(a) = {aid} ' +
        'RETURN c',
      params: {
        aid: parseInt(aid)
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

};
