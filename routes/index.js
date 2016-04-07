var express = require('express');
var router = express.Router();
var requestify = require('requestify');
var config = require('../config.js');
var soundcloud = require('../client/soundcloud');
var db = require('../client/database');

/* GET index page. */
router.get('/', function(req, res, next) {
  var connect_url = req.SC.getConnectUrl();
  res.render('index', { title: 'Express', connect_url: connect_url });
});

/*GET player page. */
/*
When using a custom player must abide by these TOS:
Credit the uploader as the creator of the sound
Credit SoundCloud as the source by including one of the logos found here
Link to the SoundCloud URL containing the work
If the sound is private link to the profile of the creator
*/
router.get('/player/', function(req, res, next) {
  var connect_url = req.SC.getConnectUrl();
  var accessToken = req.session.oauth_token;
  res.render('player', { token: accessToken, test: "ateststringtojsfile", client_id: config.auth.client_id});
});


/* GET home page. */
router.get('/home/', function(req, res, next) {

  var code = req.query.code;

  req.SC.authorize(code, function(err, accessToken) {
    if ( err ) {
      throw err;
    } else {
      req.session.oauth_token = accessToken;
      // Client is now authorized and able to make API calls
      //res.render('home', { token: accessToken });
      soundcloud.getLoggedInUser(accessToken, function(user){
        console.log("done getting user from SC");
        req.session.user = user;
        //var user_url = config.base_url + '/api/users/add';
        //var user_data = { "user": user };
        db.addUser(user, function(){
          console.log("done adding user");

          soundcloud.getCollection(user, function(collection){
            console.log("done getting collection from SC");

            db.addCollection(user, collection, function(){
              console.log("done adding collection");
              res.json({"done":"adding collection"});
            });
          });
        });
      });
    }
  });

});


/* GET home page. */
router.get('/token/', function(req, res, next) {

  res.render('token', { token: req.session.oauth_token });

});

module.exports = router;
