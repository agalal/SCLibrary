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
			const image = track[0].n.properties.artwork_url;
      Vibrant.from(image).getPalette(function(err, palette){
        if (err){
          res.json(err);
        } else {
					palette.DarkMuted = rgbToHex(palette.DarkMuted.rgb);
					palette.Muted = rgbToHex(palette.Muted.rgb);
					palette.DarkVibrant = rgbToHex(palette.DarkVibrant.rgb);
					palette.LightMuted = rgbToHex(palette.LightMuted.rgb);
					palette.LightVibrant = rgbToHex(palette.LightVibrant.rgb);
					palette.Vibrant = rgbToHex(palette.Vibrant.rgb);
					console.log(palette);
					res.json(palette);
				}
      });
		}
	});
});

function rgbToHex(rgb) {
	return '#' + (toHex(rgb[0])+toHex(rgb[1])+toHex(rgb[2]));
};

function toHex(n) {
 n = parseInt(n,10);
 if (isNaN(n)) return "00";
 n = Math.max(0,Math.min(n,255));
 return "0123456789ABCDEF".charAt((n-n%16)/16)
      + "0123456789ABCDEF".charAt(n%16);
}

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
		  res.json(track);
		}
  });
});

router.post('/:id/downloaded', function(req, res, next) {
  db.toggleDLStatus(req.params.id, req.body.id, function(track, error){
    if (error){
			res.json(error);
		} else {
		  res.json(track);
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
