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
	Game.find().populate('deckType players.user').exec(function(err, games) {
		if (err)
			return res.send(err);
		else
			return res.json(games);
	});
};

var postGame = function (req, res) {
	var game = new Game(req.body);
	game.players.push({user: req.user});
	game.deck_type = req.body.deck_type_id;

	game.save(function (err) {
		if (err)
			return res.status(422).send(err);
		else
			return res.json(game);
	});
};

var getGame = function (req, res) {
	Game.findById(req.params.game_id).populate('players.user players.hand deck').exec(function (err, game) {
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

// Pre-Game Methods
// ================

var joinGame = function (req, res) {
	Game.findById(req.params.game_id).populate('players.user').exec(function (err, game) {
		if (err)
			return res.status(422).send(error);

		if (!game) {
			return res.status(422).json({status: "Game not found."});
		}

		// Check if player is in game
		for (var i = 0; i < game.players.length; i++) {
			if (game.players[i].user._id.equals(req.user._id)) {
				return res.status(422).json({status: "Already in game"});
			}
		};

		game.players = game.players.concat({user: req.user});

		game.save(function (err) {
			if (err)
				return res.status(422).send(err);
			else
				return res.json(game);
		});
	});
};

var startGame = function (req, res) {
	Game.findById(req.params.game_id).populate('deck deck_type').exec(function (err, game) {
		if (err)
			return res.status(500).send(error);

		if (!game)
			return res.status(404).json({status: "Game not found."});

		if (game.current_round > 0)
			return res.status(403).json({error: "Game already started."});

		var Deck = mongoose.model('Deck');
		var deck = new Deck();
		deck.deck_type = game.deck_type;
		deck.cards = game.deck_type.generateDeck();
		deck.shuffleDeck();
		game.deck = deck;

		game.deck_title = game.deck_type.label;
		game.current_round = 1;
		game.distributeHands();
		game.deck.save(function (err) {
			game.save(function (err) {
				if (err) {
					return res.status(500).send(err);
				}
				else
					return res.json(game);
			});
		});
	});
};

// In-Game Methods
// ===============

var getSelf = function (req, res) {
	Game.findById(req.params.game_id).populate('players.user players.hand players.played_cards players.selected_card').exec(function (err, game) {
		if (err)
			return res.status(500).send(err);

		if (!game)
			return res.status(404).json({status: "Game not found."});

		for (var i = 0; i < game.players.length; i++) {
			if (game.players[i].user._id.equals(req.user._id)) {
				return res.json(game.players[i]);
			}
		}

		return res.status(404).json({error: "User not found"});
	});
};

var getOpponents = function (req, res) {
	Game.findById(req.params.game_id).populate('players.user players.hand players.played_cards players.selected_card').exec(function (err, game) {
		if (err)
			return res.status(500).send(err);

		if (!game)
			return res.status(404).json({status: "Game not found."});

		var opponents = [];
		game.players.forEach(function (player, index, array) {
			if (!player.user._id.equals(req.user._id)) {
				opponents = opponents.concat(player);
			}
		});

		return res.json(opponents);
	});
};

var setCard = function (req, res) {
	Game.findById(req.params.game_id).populate([{
		path: 'deck',
		model: 'Deck',
		populate: {
			path: 'cards',
			model: 'Card'
		}
	},{
		path: 'players',
		populate: [{
			path: 'user',
			model: 'User'
		},{
			path: 'hand',
			model: 'Card'
		},{
			path: 'selected_card',
			model: 'Card'
		},{
			path: 'played_cards',
			model: 'Card'
		}]
	}]).exec(function (err, game) {
		if (err)
			return res.status(500).send(err);

		if (!game)
			return res.status(404).json({status: "Game not found."});

		// Update selected_card for the currently logged in player
		game.playCard(req.user._id, req.body.card_index);

		var advanceTurn = true;
		game.players.forEach(function (player) {
			if (!player.selected_card) {
				advanceTurn = false;
			}
		});
		if (advanceTurn) game.advanceTurn();

		var advanceRound = true;
		game.players.forEach(function (player) {
			if (player.hand.length > 0) {
				advanceRound = false;
			}
		});
		if (advanceRound) game.advanceRound();

		// Check if hand is empty, if so next round

		// If hand not empty but all cards played, next turn

		// // Check if round should advance
		// var advanceRound = true;
		// game.players.forEach(function (player, index, array) {
		// 	if (player.hand.length > 0) {
		// 		advanceRound = false;
		// 	}
		// });
		// if (advanceRound) {
		// 	game.advanceRound();
		// 	game.save(function (err) {
		// 		if (err)
		// 			return res.status(500).send(err);

		// 		return res.json({status: "OK"});
		// 	});
		// }

		// // Check if turn should advance
		// var advanceTurn = true;
		// game.players.forEach(function (player, index, array) {
		// 	if (!player.selected_card) {
		// 		advanceTurn = false;
		// 	}
		// });
		// if (advanceTurn) {
		// 	game.advanceTurn();
		// }

		game.save(function (err) {
			if (err)
				return res.status(500).send(err);

			return res.json({status: "OK"});
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
router.post('/start/:game_id', startGame);

router.get('/get_self/:game_id', isLoggedIn, getSelf);
router.get('/get_opponents/:game_id', isLoggedIn, getOpponents);
router.post('/set_card/:game_id', isLoggedIn, setCard);
// router.post('/advance_turn/:game_id', isLoggedIn, advanceTurn);