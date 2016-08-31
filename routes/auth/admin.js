var express = require('express');
var router = express.Router();
var config = require('../../config.js');
var db = require('../../client/database');

var ensureLoggedOut = require('../middleware/ensureLoggedOut');
var ensureLoggedIn = require('../middleware/ensureLoggedIn');
var requiresAdmin = require('../middleware/requiresAdmin');

/* GET admin login page. */
router.get('/', function(req, res, next) {
  if (req.session && req.session.account){
    var account = req.session.account;
    console.log(account);
    if (account.a.properties.type == 'admin'){
      res.redirect('/admin/panel/');
    } else {
      var message = 'This account does not belong to an administrator.';
      res.render('adminlogin', {msg: message});
    }
  } else {
    res.render('adminlogin', {msg: null});
  }
});

/* GET admin login/submit page. */
router.get('/submit/', ensureLoggedOut, function(req, res, next) {
  var name = req.query.name;
  var password = req.query.password;
  db.loginToAccount(name, password, function(results, error){
    if (error){
      var message = 'There was an error when trying to login to your account.';
      res.render('adminlogin', {msg: message});
    }
    if (!results.account){
      var message = 'We were not able to find that account.';
      res.render('adminlogin', {msg: message});
    }
    else {
      req.session.account = results.account;
      if (results.account.a.properties.type == 'admin'){
        res.redirect('/admin/panel/');
      }
      else {
        var message = 'This account does not belong to an administrator.';
        res.render('adminlogin', {msg: message});
      }
    }
  })
});

/* GET admin panel. */
router.get('/panel/', ensureLoggedIn, requiresAdmin, function(req, res, next) {
  res.render('panel', {msg: null});
});

module.exports = router;
