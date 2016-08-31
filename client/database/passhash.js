
module.exports = function() {
  var credential = require('credential');

  var pw = credential();

  var module = {};

  module.hashPass = function (toHash, callback) {
    pw.hash(toHash, function (error, hash) {
      if(error)
          throw new Error('Something went wrong with pass hashing!');

      callback(JSON.stringify(hash));
    });
  };

  module.verifyPass = function (pass, dbPass, callback) {
    dbHash = JSON.parse(dbPass);
    pw.verify(dbHash, pass, function(error, verified) {
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
