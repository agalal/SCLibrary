var express = require('express');
var router = express.Router();

/* GET users. */
router.get('/', function(req, res) {
	res.json({hi:"there"});
});

//router.use('/add', require('./users/add'));
//router.use('/update', require('./users/update'));


module.exports = router;