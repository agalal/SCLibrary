var express = require('express');
var router = express.Router();
var db = require('../../client/database');
var sc = require('../../client/soundcloud');

/* GET API/playlist index page. */
router.get('/', function(req, res, next) {
  res.json({
    error: 'you must supply a user id'
  });
});

/* GET user */
router.get('/:id', function(req, res, next) {
  db.getUser(req.params.id, function(user, error) {
    if (error)
      res.json({
        "error": "failed"
      });
    else
      res.json(user);
  });
});

/* GET user's collection. */
router.get('/:id/collection', function(req, res, next) {
  const uid = req.params.id;
  const limit = parseInt(req.query.limit);
  const offset = parseInt(req.query.offset);
  const sort = req.query.sort;
  const reverse = req.query.reverse;
  // Get the collection from the database and render the json.
  db.getCollection(uid, limit, offset, sort, reverse, function(collection) {
    res.json(collection);
  });
})

/* POST update user's collection */
router.post('/:id/collection/update', function(req, res, next) {
  var scuid = req.params.id;
  sc.getUser(scuid, function(sc_user, error) {
    if (error) {
      res.json(error);
    }
    db.getUserByScuid(scuid, function(db_user, error) {
      if (error) {
        res.json(error);
      }
      sc.getCollection(sc_user, function(collection, error) {
        if (error) {
          res.json(error);
        }
        db.addCollection(db_user, collection, function(error, pids) {
          if (error) {
            res.json(error);
          }
          sc.getPlaylists(pids, function(playlists, error) {
            if (error) {
              res.json(error);
            }
            db.addPlaylistTracks(db_user, playlists, function(complete, error) {
              if (error) {
                res.json(error);
              } else {
                res.json({
                  "success": "success"
                });
              }
            });
          });
        });
      });
    });
  });
});

/* GET user's playlists */
router.get('/:id/playlists', function(req, res, next) {
  db.getPlaylists(req.params.id, function(playlists, error) {
    if (error) {
      res.json({ "error": "failed" });
    } else {
      res.json(playlists);
    }
  });
});

/* GET user's playlist */
router.get('/:id/playlists/:pid', function(req, res, next) {
	db.getPlaylist(req.params.id, req.params.pid, function(collection, error){
		if (error) {
			res.json({"error":"failed"});
		} else {
			res.json(collection);
    }
	});
});


/* GET user's soundcloud playlists */
router.get('/:id/scplaylists', function(req, res, next) {
  db.getSCPlaylists(req.params.id, function(playlists, error) {
    if (error) {
      res.json({ "error": "failed" });
    } else {
      res.json(playlists);
    }
  });
});

/* GET user's soundcloud playlist */
router.get('/:uid/scplaylists/:pid', function(req, res, next) {
  db.getSCPlaylist(req.params.uid, req.params.pid, function(playlists, error) {
    if (error) {
      res.json({ "error": "failed" });
    } else {
      res.json(playlists);
    }
  });
});

/* GET user's channels */
router.get('/:id/channels', function(req, res, next) {
  db.getChannels(req.params.id, function(channels, error) {
    if (error) {
      res.json({ "error": "failed" });
    } else {
      res.json(channels);
    }
  });
});

/* GET liked tracks from a specified channel */
router.get('/:uid/channels/:cid', function(req, res, next) {
  db.getLikedTracksByChannel(req.params.uid, req.params.cid, function(tracks, error) {
    if (error) {
      res.json({ "error": "failed" });
    } else {
      res.json(tracks);
    }
  });
});


module.exports = router;
