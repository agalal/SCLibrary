var express = require('express');
var router = express.Router();
var db = require('../../client/database');

/* GET API/playlist index page. */
router.get('/', function(req, res, next) {
	res.json({ error: 'you must supply a playlist id' });
});

/* POST new playlist */
router.post('/', function(req, res, next){
	db.createPlaylist(req.body.name, req.body.uid, function(error){
		if (error)
			res.json({"error":"failed"});
		else
			res.json({"success":"playlist created"});
	});
});

/* DELETE playlist */
router.delete('/:id', function(req, res, next){
	db.deletePlaylist(req.params.id, function(error){
		if (error)
			res.json({"error":"failed"});
		else
			res.json({"success":"playlist deleted"});
	});
});

/* POST track to playlist */
router.post('/:pid/add/:tid', function(req, res, next){
	db.addTrackToPlaylist(req.params.tid, req.params.pid, function(error){
		if (error)
			res.json({"error":"failed"});
		else
			res.json({"success":"track added to playlist"});
	});
});

/* DELETE track from playlist */
router.delete('/:pid/remove/:tid', function(req, res, next){
	db.removeTrackFromPlaylist(req.params.tid, req.params.pid, function(error){
		if (error)
			res.json({"error":"failed"});
		else
			res.json({"success":"track removed from playlist"});
	});
});


module.exports = router;
