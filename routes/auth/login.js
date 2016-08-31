var express = require('express');
var router = express.Router();
var config = require('../../config.js');
var db = require('../../client/database');

var ensureLoggedOut = require('../middleware/ensureLoggedOut');

/* GET login page. */
router.get('/', ensureLoggedOut, function(req, res, next) {
  res.render('login', {
    msg: null
  });
});

/* POST login/submit page. */
router.post('/submit/', ensureLoggedOut, function(req, res, next) {
  var name = req.body.name;
  var password = req.body.password;

  db.loginToAccount(name, password, function(results, error) {
    var message;
    if (error) {
      message = 'There was an error when trying to login to your account.';
    } else if (!results.account) {
      message = 'We were not able to find that account.';
    } else if (!results.account.a.properties.approved) {
      message = 'This account has not yet been approved.';
    } else if (results.users.length > 0) {
      req.session.account = results.account;
      req.session.user = results.users[0].u;
      res.redirect('/library/');
      return;
    } else {
      const util = require('util');

      console.log(util.inspect(results, {showHidden: false, depth: null}));
        message = "You don't have any soundcloud accounts associated with your username";
    }
    res.render('login', {
      msg: message
    });
  })
});

module.exports = router;
