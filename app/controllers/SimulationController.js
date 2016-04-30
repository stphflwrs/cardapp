var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose-q')(require('mongoose')),
	Simulation = mongoose.model('Simulation'),
	Game = mongoose.model('Game'),
	DeckType = mongoose.model('DeckType'),
	Deck = mongoose.model('Deck');

module.exports = function (app) {
	app.use('/api/simulation', router);
};

function postCreate(req, res) {
	var simulation = new Simulation(req.body);
	simulation.save()
	.then(function (simulation) {
		res.json(simulation);
	})
	.catch(function (error) {
		console.log(error);
		res.status(500).send(error);
	});
}

function postSetAI(req, res) {
	Simulation.findById(req.body.id).exec()
	.then(function (simulation) {
		simulation.playerModel1 = req.body.playerModel1;
		simulation.playerModel2 = req.body.playerModel2;
		
		return simulation.save();
	})
	.then(function (simulation) {
		res.json(simulation);
	})
	.catch(function (error) {
		console.log(error);
		res.status(500).send(error);
	});
}

function postInitialize(req, res) {
	Simulation.findByIdQ(req.body.id)
	.then(function (simulation) {
		var baseGame = new Game({
			title: 'sim' + simulation._id.toString(),
			deck_type: '56e65e5a07c42a480dfb0a18'
		});

		var Player1 = mongoose.model(simulation.playerModel1);
		var Player2 = mongoose.model(simulation.playerModel2);
		var player1 = new Player1();
		var player2 = new Player2();

		return [simulation, baseGame.save(), player1.save(), player2.save(), DeckType.findByIdQ(baseGame.deck_type)];
	})
	.spread(function (simulation, game, player1, player2, deckType) {
		var deck = new Deck();
		deck.deck_type = deckType;
		deck.cards = deckType.generateDeck();

		game.deck = deck;
		game.deck_title = deckType.label;

		game.ai_players.push({user: player1});
		game.ai_players.push({user: player2});

		simulation.baseGame = game;
		return [simulation.save(), deck.save(), game.save()];
	})
	.spread(function (simulation, deck, game) {
		res.json(simulation);
	})
	.catch(function (error) {
		console.log(error);
		res.status(500).send(error);
	});
}

function postStart(req, res) {
	Simulation.findById(req.body.id).execQ()
	.then(function (simulation) {
		var gamePromise = Game.findById(simulation.baseGame)
		.populate([{
			path: 'deck',
			model: 'Deck'
		},{
			path: 'deck_type',
			model: 'DeckType'
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
		}]).execQ();
		return [simulation, gamePromise];
	})
	.spread(function (simulation, game) {
		simulation.baseGame = game;
		var deckPromise = Deck.findById(game.deck._id).populate('cards').execQ();
		return [simulation, deckPromise];
	})
	.spread(function (simulation, deck) {
		var copiedGame = JSON.parse(JSON.stringify(simulation.baseGame));
		var copiedDeck = JSON.parse(JSON.stringify(deck));
		// objectIdDel(copiedGame);
		delete copiedGame._id;
		delete copiedDeck._id;
		
		var newDeck = new Deck(copiedDeck);
		newDeck.shuffleDeck();
		console.log(newDeck);
		var newGame = new Game(copiedGame);
		return [simulation, newGame.save(), newDeck.save()];
	})
	.spread(function (simulation, game, deck) {
		game.deck = deck;
		simulation.games = simulation.games.concat(game);
		return [simulation.save(), game.save()];
	})
	.spread(function (simulation, game) {
		var gamePromise = Game.findById(simulation.games[0])
		.populate([{
			path: 'deck',
			model: 'Deck'
		},{
			path: 'deck_type',
			model: 'DeckType'
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
		}]).execQ();

		return [simulation, gamePromise];
	})
	.spread(function (simulation, game) {
		var deckPromise = Deck.findById(game.deck._id).populate('cards').execQ();
		// console.log(game.ai_players);

		return [simulation, game, deckPromise];
	})
	.spread(function (simulation, game, deck) {
		game.deck = deck;
		// console.log(JSON.stringify(game));
		// setTimeout(function () { game.advanceGame() }, 0);
		setInterval(function () {
			var canAdvance = true;
			if (game.current_round == 0) {
				game.advanceGame();
			}
			else if (game.ai_players[0].selected_card && game.ai_players[1].selected_card && game.current_round <= game.max_rounds) {
				game.advanceGame();
			}
			else if (game.current_round > game.max_rounds) {
				console.log("Simulation Done!");
				clearInterval(this);
			}
		}, 50);
		res.json(game);
	})
	.catch(function (error) {
		console.log(error);
		res.status(500).send(error);
	});
}

var objectIdDel = function(copiedObjectWithId) {
  if (copiedObjectWithId != null && typeof(copiedObjectWithId) != 'string' &&
    typeof(copiedObjectWithId) != 'number' && typeof(copiedObjectWithId) != 'boolean' ) {
    //for array length is defined however for objects length is undefined
    if (typeof(copiedObjectWithId.length) == 'undefined') { 
      delete copiedObjectWithId._id;
      for (var key in copiedObjectWithId) {
        objectIdDel(copiedObjectWithId[key]); //recursive del calls on object elements
      }
    }
    else {
      for (var i = 0; i < copiedObjectWithId.length; i++) {
        objectIdDel(copiedObjectWithId[i]);  //recursive del calls on array elements
      }
    }
  }
} 

router.post('/create', postCreate);
router.post('/setai', postSetAI);
router.post('/init', postInitialize);
router.post('/start', postStart);