var express = require('express');
var router = express.Router();
var requestify = require('requestify');
var config = require('../config.js');
var soundcloud = require('../client/soundcloud');
var db = require('../client/database');
var Q = require('q');

var ensureLoggedIn = require('./middleware/ensureLoggedIn');
var ensureLoggedOut = require('./middleware/ensureLoggedOut');

var request = require('./auth/request');
var login = require('./auth/login');
var admin = require('./auth/admin');

//For auto-finding songs
var http = require('http');
var https = require('https');
var fs = require('fs');
var GoogleSearch = require('google-search');
var $ = require('jQuery');

/*var googleSearch = new GoogleSearch({
  key: 'AIzaSyAs5VY0JX2-B9St_3wQEacyjRDFRZ_OHe4',
  cx: '014713471355677183001:be58owrujy4'
});*/

router.use('/login/', login);
router.use('/request/', request);
router.use('/admin/', admin);

/* GET index page. */
router.get('/', ensureLoggedOut, ensureLoggedIn);

router.get('/songfind', ensureLoggedIn, function(req, res, next){
  //In order to get the actual URL of the mp3 you need to resolve it
  var preUrl = "http://api.soundcloud.com/tracks/264571232/stream?client_id=a3629314a336fd5ed371ff0f3e46d4d0";
  var resolvedUrlBuf = "";
  var resolvedUrl = "";
  http.get(preUrl, function(res) {
    res.on('data', function(chunk) {
      resolvedUrlBuf += chunk;
      //console.log("chunk");
      //console.log(chunk.toString());
    });
    res.on('end', function() {
      // all data has been downloaded
      var responseJson = JSON.parse(resolvedUrlBuf);
      console.log("responseJson.location:");
      console.log(responseJson.location);
      resolvedUrl = responseJson.location;
      getMp3FromResolvedUrl(resolvedUrl);
      //getSearchResults
      /*console.log(body);
      console.log("finished downloading");*/
    });
  });

});

  function getMp3FromResolvedUrl(resolvedUrl){
    //Now download the song
    var songFile = fs.createWriteStream("test.mp3");
    //var fileBuf = new Buffer();
    https.get(resolvedUrl, function(res) {
    res.on('data', function(chunk) {
      songFile.write(chunk);
    });
    res.on('end', function() {
      //whole song has been downloaded
      songFile.end();
      console.log("finished downloading song");

      var songName = "Justin Martin & Ardalan Ft. PartyPatty- FUNCTION VIP";
      getGoogleZippyResults(songName);
      //getZippySearchResults(songName);
      //customGoogleSearch(songName);
      /*console.log(body);
      console.log("finished downloading");*/
    });
  });
  }

  function getGoogleZippyResults(songName){
    var searchUrl = "https://www.google.com/search?q=";
    songName += " site:zippyshare.com"
    console.log(parseSongNameWhitespace(songName));
    searchUrl += parseSongNameWhitespace(songName);
    //Get Results
    var htmlString = "";
    console.log("searchUrl: " + searchUrl);
    https.get(searchUrl, function(res) {
      res.on('data', function(chunk) {
        htmlString += chunk;
        //console.log("chunk");
        //console.log(chunk.toString());
      });
      res.on('end', function() {
        // all data has been downloaded
        console.log("resolved zippysearch results:");
        var regex = /<cite>(.*)<\/cite>/g;
        var searchUrls = htmlString.match(regex);
        for(var i = 0; i < searchUrls.length; i++){
            searchUrls[i] = searchUrls[i].replace("<cite>", "");
            searchUrls[i] = searchUrls[i].replace("</cite>", "");
            console.log(searchUrls[i]);
        }
        downloadSearchResults(searchUrls, 0);
        /*var string = '<div><input type="text" value="val" /></div>';*/
        //$('<div/>').html(htmlString).contents();
/*        var string = '<div><input type="text" value="val" /></div>',
        object = $('<div/>').html(string).contents();
        console.log(object.find('cite').val());
        var html = html = $.parseHTML(htmlString);
*/
        //console.log(htmlString);
      });
    });
  }

//zippyshare wants me to use these or else it rejects my connection, hot.
var agentOptions = {
    host: 'zippyshare.com'
//, port: '443'
 ,path: '/'
, rejectUnauthorized: false
};

var agent = new http.Agent(agentOptions);
  //this might just be actually loading zippy's home page.
  function downloadSearchResults(urls, index){
    if(index < urls.length){
      var domainString = urls[index].substring(0, urls[index].indexOf('.'));
      console.log("domainString: " + domainString);
      var htmlString = "";
      console.log("going to url: " + urls[index]);
      http.get({url: "http://" + urls[index], agent: agent}, function(res) {
      //http.get({url: "http://" + urls[index]}, function(res) {
      res.on('data', function(chunk) {
        htmlString += chunk;
        //console.log("chunk");
        //console.log(chunk.toString());
      });
      res.on('end', function() {
        // all data has been downloaded
        console.log("resolved google results:");
        console.log(htmlString);
        var regex = /<a id=\"dlbutton\" href=\">(.*)\">/g;
        var searchUrls = htmlString.match(regex);
        for(var i = 0; i < searchUrls.length; i++){
            searchUrls[i] = searchUrls[i].replace("<cite>", "");
            searchUrls[i] = searchUrls[i].replace("</cite>", "");
            console.log(searchUrls[i]);
        }
        //var regex = /<cite>(.*)<\/cite>/g;
      });
    });
    }
  }

  function getZippySearchResults(songName){
    //Create search URL
    var searchUrl = "http://zippysharesearch.com/results.html?q=";
    songName += " site:zippyshare.com"
    //TODO: change the whitespace from what it is to whatever google prefers (maybe more search results)
    console.log(parseSongNameWhitespace(songName));
    searchUrl += parseSongNameWhitespace(songName);
    //Get Results
    var htmlString = "";
    http.get(searchUrl, function(res) {
      res.on('data', function(chunk) {
        htmlString += chunk;
        //console.log("chunk");
        //console.log(chunk.toString());
      });
      res.on('end', function() {
        // all data has been downloaded
        //console.log("resolved zippysearch results:");

        //console.log(htmlString);
      });
    });
  }

  function parseSongNameWhitespace(songName){
    //Remove excess white space and change spaces to %20
    return encodeURIComponent(songName.trim());
  }

/*GET library page. */
router.get('/library/', ensureLoggedIn, function(req, res, next) {
  // Retrieve the user from the session.
  var user = req.session.user;
  // Render the library page.
  res.render('library', {
    user: user,
    client_id: config.auth.client_id
  });
});

/*GET logout page. */
router.get('/logout/', ensureLoggedIn, function(req, res, next) {
  // Destroy the session.
  req.session.destroy(function(err) {
      console.log(err);
    })
    // Redirect to the home page.
  res.redirect('/login/');
})

module.exports = router;
