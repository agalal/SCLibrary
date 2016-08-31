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
  const options = {
    'uid': parseInt(req.params.id),
    'cid': parseInt(req.query.cid),
    'pid': parseInt(req.query.pid),
    'spid': parseInt(req.query.spid),
    'context': req.query.context,
    'limit': parseInt(req.query.limit),
    'offset': parseInt(req.query.offset),
    'sort': req.query.sort,
    'reverse': req.query.reverse,
    'search': req.query.q
  }
  // Get the collection from the database and render the json.
  db.getTrackPage(options, function(page) {
    res.json(page);
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

module.exports = router;
