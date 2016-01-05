var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	Game = mongoose.model('Game');

module.exports = function (app) {
	app.use('/api/game/', router);
};

