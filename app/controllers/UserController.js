var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;

module.exports = function(app) {
	app.use('/api/users', router);
};

router.get('/', function(req, res) {
	User.find(function(err, users) {
		if (err) res.send(err);

		else res.json(users);
	});
});

router.get('/current', isLoggedIn, function(req, res) {
	return res.send({ user: req.user });
});

router.post('/login', function(req, res, next) {
	console.log(req);
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
});

router.get('/logout', function(req, res) {
	req.logout();
	return res.send({ status: 'OK' });
});

router.post('/register', function(req, res, next) {
	passport.authenticate('local-register', function(err, user, info) {
		if (err) return next(err);

		if (!user) {
			return res.status(422).send({ status: 'FAIL' , errors: info });
		}

		return res.send({ status: 'OK' });
	})(req, res, next);
});

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		console.log(req);
		return next();
	}
	else
		return res.status(401).send({ status: "Not logged in." });
}