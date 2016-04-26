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

		var Player = mongoose.model(req.body.playerModel);

		// var RandomAIPlayer = mongoose.model('BasicRLPlayer');
		var player = new Player();
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

		// Deck generation
		var Deck = mongoose.model('Deck');
		var deck = new Deck();
		deck.deck_type = game.deck_type;
		deck.cards = game.deck_type.generateDeck();
		deck.shuffleDeck();
		game.deck = deck;
		game.deck_title = game.deck_type.label;
		
		//game.current_round = 1;
		//game.distributeHands();
		game.deck.save(function (err) {
			game.save(function (err) {
				if (err) {
					return res.status(500).send(err);
				}
				else {
					var Deck = mongoose.model('Deck');
					Deck.findById(game.deck._id).populate('cards').exec(function (error, deck) {
						if (!error) {
							game.deck = deck;
							setTimeout(game.advanceGame(), 0);
						}
					});
					return res.json(game);
				}
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
			path: 'played_cards',
			model: 'Card'
		},{
			path: 'game_cards',
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
			path: 'game_cards',
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

		// Play a card depending on whether or a swapper was played
		if (req.body.swapper_index != undefined) {
			game.playCard(req.user._id, req.body.card_index, req.body.swapper_index, req.body.other_card_index);
		}
		else {
			game.playCard(req.user._id, req.body.card_index);
		}
		game.save(function (err) {
			if (err) {
				console.log(err);
				return res.status(500).send(err);
			}

			io.to("game" + game._id).emit('advance turn');
			game.advanceGame();
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

function canPlay(req, res, next) {
	Game.findById(req.params.game_id).populate('players.user players.hand players.played_cards').exec(function (err, game) {
		if (err)
			return res.status(500).send(err);

		if (!game)
			return res.status(404).json({ status: "Game not found." });

		// Assumes already in game

		// Find player
		var player = undefined;
		for (var i = 0; i < game.players.length; i++) {
			if (game.players[i].user._id.equals(req.user._id)) {
				player = game.players[i];
				break;
			}
		}

		// Check card_index is valid
		var cardIndex = req.body.card_index
		if (cardIndex < 0 || cardIndex >= player.hand.length) {
			return res.status(400).json({ status: "Index out of range." });
		}

		// Check if they can play a swapper card
		if (req.body.swapper_index) {
			var swapperIndex = req.body.swapper_index;
			if (!player.played_cards[swapperIndex].value.split()[1] == "swapper") {
				return res.status(400).json({ status: "Invalid move." });
			}
		}

		return next();
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
router.post('/set_card/:game_id', isLoggedIn, inGame, canPlay, setCard);