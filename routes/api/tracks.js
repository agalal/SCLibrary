var express = require('express');
var router = express.Router();
var db = require('../../client/database');
var request = require('request');
//Pull dominant colors from image for a track
Vibrant = require('node-vibrant')

router.get('/:id/waveform', function(req, res, next) {
	db.getTrack(req.params.id, function(track, error){
		if (error){
			res.json(error);
		} else {
		    var options = {
		        url: track[0].n.properties.waveform_url,
		        method: 'GET'
		    }
		    request(options, function(error, message, object){
		        if (error){
                console.log(error);
		            res.json(error);
		        }
		        else {
		            var json = JSON.parse(object);
		            res.json(json.samples);
		        }
		    });
		}
	});
});

router.get('/:id/palette', function(req, res, next) {
	db.getTrack(req.params.id, function(track, error){
		if (error){
			res.json(error);
		} else {
	      Vibrant.from(track[0].n.properties.artwork_url).getPalette (function(err, palette){
	        if (err){
	          return res.json(err);
	        }
	        return res.json(palette);
	      });
		}
	});
});

router.post('/:id/rate', function(req, res, next) {
  db.rateTrack(req.params.id, req.body.id, req.body.rating, function(track, error){
    if (error){
			res.json(error);
		} else {
		  res.json({"success":"track rated"});
		}
  });
});

router.post('/:id/playcount', function(req, res, next) {
  db.incPlayCount(req.params.id, req.body.id, function(track, error){
    if (error){
			res.json(error);
		} else {
		  res.json({"success":"playcount incremented"});
		}
  });
});

router.post('/:id/downloaded', function(req, res, next) {
  db.toggleDLStatus(req.params.id, req.body.id, function(track, error){
    if (error){
			res.json(error);
		} else {
		  res.json({"success":"download status toggled"});
		}
  });
});

router.post('/:id/deleted', function(req, res, next) {
  db.toggleDeletedStatus(req.params.id, req.body.id, function(track, error){
    if (error){
			res.json(error);
		} else {
		  res.json({"success":"deleted status toggled"});
		}
  });
});


module.exports = router;
