var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	Game = mongoose.model('Game');

module.exports = function (app) {
	app.use('/api/games/', router);
};

// Standard CRUD
// =============

var getGames = function (req, res) {
	Game.find().populate('deckType players').exec(function(err, games) {
		if (err)
			return res.send(err);
		else
			return res.json(games);
	});
};

var postGame = function (req, res) {
	var game = new Game(req.body);
	game.players[0] = req.user;

	game.save(function (err) {
		if (err)
			return res.status(422).send(err);
		else
			return res.json(game);
	});
};

var getGame = function (req, res) {
	Game.findById(req.params.game_id).populate('players deck').exec(function (err, game) {
		if (err)
			return res.send(err);
		else
			return res.json(game);
	});
};

var deleteGame = function (req, res) {
	Game.remove({
		_id: req.params.game_id
	}, function (err) {
		if (err)
			return res.send(err);
		else
			return res.json({status: 'OK'});
	});
};

// Other Methods
// =============

var joinGame = function (req, res) {
	Game.findById(req.params.game_id).populate('players').exec(function (err, game) {
		if (err)
			return res.status(422).send(error);

		if (!game) {
			return res.status(422).json({status: "Game not found."});
		}

		// Check if player is in game
		for (var i = 0; i < game.players.length; i++) {
			if (game.players[i]._id.equals(req.user._id)) {
				return res.status(422).json({status: "Already in game"});
			}
		};

		game.players = game.players.concat(req.user);

		game.save(function (err) {
			if (err)
				return res.status(422).send(err);
			else
				return res.json(game);
		});
	});
};

var initDeck = function (req, res) {
	Game.findById(req.params.game_id).populate('deck players').exec(function (err, game) {
		if (err)
			return res.status(500).send(error);

		if (!game)
			return res.status(404).json({status: "Game not found."});

		var DeckType = mongoose.model('DeckType');
		DeckType.findById(req.body.deck_type_id).exec(function (err, deckType) {
			if (err)
				return res.status(500).send(error);

			if (!deckType)
				return res.status(404).json({status: "Deck Type not found"});

			var Deck = mongoose.model('Deck');
			var deck = new Deck();
			deck.deck_type = deckType;
			deck.cards = deckType.generateDeck();
			deck.shuffleDeck();
			game.deck = deck;

			game.deck_title = deckType.label;
			deck.save(function (err) {
				game.save(function (err) {
					if (err) {
						console.log(game.players);
						return res.status(500).send(err);
					}
					else
						return res.json(game);
				});
			});
		});
	});
};

// In Game Methods
// ===============

var drawCard = function (req, res) {
	Game.findById(req.params.game_id).populate('deck').exec(function (err, game) {
		if (err)
			return res.status(500).send(error);

		if (!game)
			return res.status(404).json({status: "Game not found."});

		var card = game.deck.cards.splice(0, 1);
		game.deck.save(function (err) {
			if (err)
				return res.status(500).send(err);

			var Card = mongoose.model('Card');
			Card.findById(card).exec(function (err, card) {
				if (err)
					return res.status(500).send(err);

				return res.json(card);
			});
		});
	});
};

var drawCards = function (req, res) {
	if (!req.body.num_cards)
		return res.status(422).json({error: "num_cards is required."});

	Game.findById(req.params.game_id).populate({
		path: 'deck',
		model: 'Deck',
		populate: {
			path: 'cards',
			model: 'Card'
		}
	}).exec(function (err, game) {
		if (err)
			return res.status(500).send(error);

		if (!game)
			return res.status(404).json({status: "Game not found"});

		var cards = game.deck.cards.splice(0, req.body.num_cards);
		game.deck.save(function (err) {
			if (err)
				return res.status(500).send(err);

			return res.json(cards);
		});
	});
};

// Middleware
// ==========

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	else
		return res.status(401).send({ status: "Not logged in." });
}

// Routes
// ======

router.get('/', getGames);
router.post('/create', isLoggedIn, postGame);
router.get('/retrieve/:game_id', getGame);
router.delete('/delete/:game_id', deleteGame);

router.post('/join/:game_id', isLoggedIn, joinGame);
router.post('/init_deck/:game_id', initDeck);

router.post('/draw_card/:game_id', drawCard);
router.post('/draw_cards/:game_id', drawCards);