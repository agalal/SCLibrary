module.exports = function(credential) {

  var module = {};

  module.hashPass = function (toHash, callback) {
    cerendital.hash(toHash, function (error, hash) {
      if(error)
          throw new Error('Something went wrong with pass hashing!');
      // TODO the following line is extremely unsafe. Remove @hack
      console.log(hash);
      callback(hash);
    });
  };

  module.verifyPass = function (pass, dbPass, callback) {
    credential.verify(dbPass, pass, function(error, verified) {
        if(error)
            throw new Error('Something went wrong!');
        if(!verified) {
          callback(false);
        } else {
          callback(true);
        }
    });
  };

  return module;
}
