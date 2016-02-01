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
	game.players = game.players.concat({user: req.user});

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

// Other Methods
// =============

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

var initDeck = function (req, res) {
	Game.findById(req.params.game_id).populate('deck').exec(function (err, game) {
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

var distributeCards = function (req, res) {
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

		game.players.forEach(function (player, index, array) {
			player.hand = game.deck.cards.splice(0, game.hand_size);
		});

		game.deck.save(function (err) {
			if (err)
				return res.status(500).send(err);

			game.save(function (err) {
				if (err)
					return res.status(500).send(err);

				return res.json(game);
			});
		});
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
		for (var i = 0; i < game.players.length; i++) {
			if (game.players[i].user._id.equals(req.user._id)) {
				if (game.players[i].selected_card) {
					game.players[i].hand = game.players[i].hand.concat(game.players[i].selected_card);
				}

				game.players[i].selected_card = game.players[i].hand.splice(req.body.card_index, 1)[0];
				break;
			}
		}

		// Check if turn should advance
		var advanceTurn = true;
		game.players.forEach(function (player, index, array) {
			if (!player.selected_card) {
				advanceTurn = false;
			}
		});
		if (advanceTurn) {
			game.advanceTurn();
		}

		// Check if round should advance
		var advanceRound = true;
		game.players.forEach(function (player, index, array) {
			if (player.hand.length > 0) {
				advanceRound = false;
			}
		});
		if (advanceRound) {
			game.advanceRound();
		}

		game.save(function (err) {
			if (err)
				return res.status(500).send(err);

			return res.json({status: "OK"});
		});
	});
};

// var advanceTurn = function (req, res) {
// 	Game.findById(req.params.game_id).populate('players.user players.hand players.played_cards players.selected_card').exec(function (err, game) {
// 		if (err)
// 			return res.status(500).send(err);

// 		if (!game)
// 			return res.status(404).json({status: "Game not found."});

// 		// Move selected card to played cards
// 		game.players.forEach(function (player, index, array) {
// 			player.played_cards.push(player.selected_card);
// 			player.selected_card = undefined;
// 		});

// 		// Move hands to the next player
// 		var tempHand = game.players[0].hand;
// 		for (var i = 0; i < game.players.length; i++) {
// 			// Last player
// 			if (i == game.players.length - 1) {
// 				game.players[0].hand = tempHand;
// 			}
// 			else {
// 				var temp = game.players[i + 1].hand;
// 				game.players[i + 1].hand = tempHand;
// 				tempHand = temp;
// 			}
// 		}

// 		game.save(function (err) {
// 			if (err)
// 				return res.status(500).send(err);

// 			return res.json({status: "OK"});
// 		});
// 	});
// };

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

router.get('/get_self/:game_id', isLoggedIn, getSelf);
router.get('/get_opponents/:game_id', isLoggedIn, getOpponents);
router.post('/distribute_cards/:game_id', distributeCards);
router.post('/set_card/:game_id', isLoggedIn, setCard);
// router.post('/advance_turn/:game_id', isLoggedIn, advanceTurn);