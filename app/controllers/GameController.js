var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	Game = mongoose.model('Game');

var io = undefined;
module.exports = function (app, _io) {
	app.use('/api/games/', router);

	io = _io;
	io.on('connection', function (socket) {
		socket.join("game" + socket.handshake.query.gameID);
		io.to("game" + socket.handshake.query.gameID).emit('user join', "A user joined this room!");
	});
};

// Standard CRUD
// =============

var getGames = function (req, res) {
	Game.find().populate('deckType players.user ai_players.user').exec(function(err, games) {

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
	Game.findById(req.params.game_id).populate('deck players.user players.hand ai_players.user ai_players.hand').exec(function (err, game) {
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
			return res.status(404).json({status: "Game not found."});
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

var addAIPlayer = function (req, res) {
	Game.findById(req.params.game_id).populate('players.user ai_players.user').exec(function (err, game) {
		if (err)
			return res.status(422).send(err);

		if (!game) {
			return res.status(404).json({status: "Game not found."});
		}

		var RandomAIPlayer = mongoose.model('RandomAIPlayer');
		var player = new RandomAIPlayer();
		player.save(function (err) {
			if (err)
				return res.status(422).send(err);

			game.ai_players.push({user: player});
			game.save(function (err) {
				if (err)
					return res.status(422).send(err);
				else
					return res.json(game);
			});
		});
	});
};

var startGame = function (req, res) {
	Game.findById(req.params.game_id).populate([{
		path: 'deck',
		model: 'Deck'
	},{
		path: 'deck_type',
		model: 'DeckType'
	},{
		path: 'players',
		populate: [{
			path: 'user',
			model: 'User'
		},{
			path: 'hand',
			model: 'Card'
		},{
			path: 'played_cards',
			model: 'Card'
		},{
			path: 'selected_card',
			model: 'Card'
		}]
	},{
		path: 'ai_players',
		populate: [{
			path: 'user',
			model: 'AIPlayer'
		},{
			path: 'hand',
			model: 'Card'
		},{
			path: 'played_cards',
			model: 'Card'
		},{
			path: 'selected_card',
			model: 'Card'
		}]
	}]).exec(function (err, game) {
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
	Game.findById(req.params.game_id).populate([{
		path: 'players',
		populate: [{
			path: 'user',
			model: 'User'
		},{
			path: 'hand',
			model: 'Card'
		},{
			path: 'played_cards',
			model: 'Card'
		},{
			path: 'selected_card',
			model: 'Card'
		}]
	},{
		path: 'ai_players',
		populate: [{
			path: 'user',
			model: 'AIPlayer'
		},{
			path: 'hand',
			model: 'Card'
		},{
			path: 'played_cards',
			model: 'Card'
		},{
			path: 'selected_card',
			model: 'Card'
		}]
	}]).exec(function (err, game) {
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
		game.ai_players.forEach(function (aiPlayer, index) {
			opponents.push(aiPlayer);
		});

		return res.json(opponents);
	});
};

var getPlayers = function (req, res) {
	Game.findById(req.params.game_id).populate([{
		path: 'players',
		populate: [{
			path: 'user',
			model: 'User'
		},{
			path: 'played_cards',
			model: 'Card'
		}]
	},{
		path: 'ai_players',
		populate: [{
			path: 'user',
			model: 'AIPlayer'
		},{
			path: 'played_cards',
			model: 'Card'
		}]
	}]).exec(function (err, game) {
		if (err)
			return res.status(500).send(err);

		if (!game)
			return res.status(404).json({status: "Game not found."});

		return res.json(game.players.concat(game.ai_players));
	});
};

var setCard = function (req, res) {
	Game.findById(req.params.game_id).populate([{
		path: 'deck',
		model: 'Deck'
	},{
		path: 'players',
		populate: [{
			path: 'user',
			model: 'User'
		},{
			path: 'hand',
			model: 'Card'
		},{
			path: 'played_cards',
			model: 'Card'
		},{
			path: 'selected_card',
			model: 'Card'
		}]
	},{
		path: 'ai_players',
		populate: [{
			path: 'user',
			model: 'AIPlayer'
		},{
			path: 'hand',
			model: 'Card'
		},{
			path: 'played_cards',
			model: 'Card'
		},{
			path: 'selected_card',
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
		game.ai_players.forEach(function (aiPlayer) {
			if (!aiPlayer.selected_card) {
				advanceTurn = false;
			}
		});
		if (advanceTurn) {
			game.advanceTurn();

			game.players.forEach(function (player) {
				player.score = Game.calculateScore(player.played_cards);
			});

			game.ai_players.forEach(function (player) {
				player.score = Game.calculateScore(player.played_cards);
			});
		}

		var advanceRound = true;
		game.players.forEach(function (player) {
			if (player.hand.length > 0) {
				advanceRound = false;
			}
		});
		game.ai_players.forEach(function (aiPlayer) {
			if (aiPlayer.hand.length > 0) {
				advanceRound = false;
			}
		});
		if (advanceRound) game.advanceRound();

		game.save(function (err) {
			if (err)
				return res.status(500).send(err);

			if (advanceTurn)
				io.to("game" + game._id).emit('advance turn');
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

function inGame(req, res, next) {
	Game.findById(req.params.game_id).exec(function (err, game) {
		if (err)
			return res.status(500).send(err);

		if (!game)
			return res.status(404).json({ status: "Game not found." });

		var output = false;
		game.players.forEach(function (player) {
			if (player.user.equals(req.user._id)) {
				output = true;
			}
		});

		if (output == true)
			return next();
		else
			return res.status(401).send({ status: "Not in game." });
	});
}

function canJoin(req, res, next) {
	Game.findById(req.params.game_id).exec(function (err, game) {
		if (err)
			return res.status(500).send(err);

		if (!game)
			return res.status(404).json({ status: "Game not found." });

		if (game.current_round <= 0 && game.players.length + game.ai_players.length < game.max_players)
			return next();
		else
			return res.status(401).json({ status: "Game is full or has started already." });
	});
}

// Routes
// ======

router.get('/', getGames);
router.post('/create', isLoggedIn, postGame);
router.get('/retrieve/:game_id', getGame);
router.delete('/delete/:game_id', deleteGame);

router.post('/join/:game_id', isLoggedIn, canJoin, joinGame);
router.post('/addai/:game_id', isLoggedIn, inGame, canJoin, addAIPlayer);
router.post('/start/:game_id', isLoggedIn, inGame, startGame);

router.get('/get_self/:game_id', isLoggedIn, getSelf);
router.get('/get_opponents/:game_id', isLoggedIn, getOpponents);
router.get('/get_players/:game_id', getPlayers);
router.post('/set_card/:game_id', isLoggedIn, setCard);