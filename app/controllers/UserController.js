var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;

module.exports = function(app) {
	app.use('/api/users', router);
};

// Methods

var getUsers = function (req, res) {
	User.find(function(err, users) {
		if (err) res.send(err);

		else res.json(users);
	});
};

var getCurrent = function (req, res) {
	return res.json(req.user);
};

var getGamesIn = function (req, res) {
	User.findById(req.params.user_id).exec(function (err, user) {
		if (err) return res.send(err);

		Game = mongoose.model('Game');
		Game.find({
			'players._id': user._id
		}).populate('players').exec(function (err, games) {
			if (err)
				return res.send(err);
			else 
				return res.json(games);
		});
	});
};

var postLogin = function (req, res, next) {
	passport.authenticate('local-login', function(err, user, info) {
		if (err) return next(err);

		if (!user) {
			return res.status(422).json({ status: 'FAIL', errors: info });
		}

		req.login(user, function(err) {
			if (err) return next(err);

			return res.send({ status: 'OK', 'user': user, 'info': info });
		})
		
	})(req, res, next);
};

var getLogout = function (req, res) {
	req.logout();
	return res.send({ status: 'OK' });
};

var postRegister = function (req, res, next) {
	passport.authenticate('local-register', function(err, user, info) {
		if (err) return next(err);

		if (!user) {
			return res.status(422).send({ status: 'FAIL' , errors: info });
		}

		return res.send({ status: 'OK' });
	})(req, res, next);
};


// Middleware

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	else
		return res.status(401).send({ status: "Not logged in." });
}

// Routes

router.get('/', getUsers);
router.get('/current', isLoggedIn, getCurrent);
router.get('/:user_id/games', getGamesIn);

router.post('/login', postLogin);
router.post('/register', postRegister);
router.get('/logout', getLogout);