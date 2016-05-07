var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose-q')(require('mongoose')),
	Simulation = mongoose.model('Simulation'),
	Game = mongoose.model('Game'),
	DeckType = mongoose.model('DeckType'),
	Deck = mongoose.model('Deck'),
	AIPlayer = mongoose.model('AIPlayer'),
	Q = require('q');

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
		// delete simulation.games;
		simulation.baseGame = game;
		var deckPromise = Deck.findById(game.deck._id).populate('cards').execQ();
		return [simulation, deckPromise];
	})
	.spread(function (simulation, deck) {
		// var copiedGame = JSON.parse(JSON.stringify(simulation.baseGame));
		// var copiedDeck = JSON.parse(JSON.stringify(deck));
		// // objectIdDel(copiedGame);
		// delete copiedGame._id;
		// delete copiedDeck._id;
		
		// var newDeck = new Deck(copiedDeck);
		// newDeck.shuffleDeck();
		// console.log(newDeck);
		// var newGame = new Game(copiedGame);

		var copiedGames = [];
		var copiedDecks = [];
		var newGames = [];
		var newDecks = [];
		var gamePromises = [];
		var deckPromises = [];
		for (var i = 0; i < simulation.maxSimulations; i++) {
			copiedGames[i] = JSON.parse(JSON.stringify(simulation.baseGame));
			delete copiedGames[i]._id;

			copiedDecks[i] = JSON.parse(JSON.stringify(deck));
			delete copiedDecks[i]._id;

			newGames[i] = new Game(copiedGames[i]);
			newDecks[i] = new Deck(copiedDecks[i]);
			newDecks[i].shuffleDeck();
			newGames[i].deck = newDecks[i];

			gamePromises[i] = newGames[i].save();
			deckPromises[i] = newDecks[i].save();
		}

		// return [simulation, newGame.save(), newDeck.save()];
		return [simulation, Q.all(gamePromises), Q.all(deckPromises)];
	})
	.spread(function (simulation, games, decks) {
		// game.deck = deck;
		// simulation.games = simulation.games.concat(game);
		// return [simulation.save(), game.save()];

		for (var i = 0; i < simulation.maxSimulations; i++) {
			// games[i].deck = decks[i];
			simulation.games = simulation.games.concat(games[i]);
		}

		return [simulation.save(), games];
	})
	.spread(function (simulation, games) {
		// console.log(simulation);
		// console.log(games[0].deck.cards);
		// res.json({status: 'OK'});

		var gamePromises = [];
		var deckPromises = [];
		for (var i = 0; i < simulation.maxSimulations; i++) {
			gamePromises[i] = Game.findById(simulation.games[i])
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

			deckPromises[i] = Deck.findById(games[i].deck._id)
			.populate([{
				path: 'cards',
				model: 'Card'
			},{
				path: 'deck_type',
				model: 'DeckType'
			}]).execQ();
		}

		return [simulation, Q.all(gamePromises), Q.all(deckPromises)];
	})
	.spread(function (simulation, games, decks) {

		for (var i = 0; i < simulation.maxSimulations; i++) {
			simulation.games[i] = games[i];
			simulation.games[i].deck = decks[i];
		}

		doThing(0);

		function doThing(index) {
			simulation.runGame(index)
			.then(function () {
				return simulation.games[index].save();
			})
			.then(function () {
				return [simulation.games[index].ai_players[0].user.save(), simulation.games[index].ai_players[1].user.save()];
			})
			.spread(function (player1, player2) {
				if (index + 1 < simulation.maxSimulations)
					return [Game.findById(simulation.games[index + 1]._id)
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
					}]).execQ(),
					Deck.findById(simulation.games[index + 1].deck._id).populate('cards').execQ()];
			})
			.spread(function (game, deck) {
				console.log("Simulation " + (index + 1) + " complete!");
				// console.log(player1);
				// console.log(player2);
				if (index + 1 < simulation.maxSimulations) {
					simulation.games[index] = {};
					simulation.games[index + 1] = game;
					simulation.games[index + 1].deck = deck
					// simulation.games[index + 1].ai_players[0].user = player1;
					// simulation.games[index + 1].ai_players[1].user = player2;
					doThing(index + 1);
				}
			})
			.catch(function (error) {
				console.log(error.stack);
			});
		}

		// for (var i = 0; i < simulation.maxSimulations; i++) {
		// 	(function (i) {
		// 		simulation.games[i] = games[i];
		// 		simulation.games[i].deck = decks[i];
		// 		simulation.runGame(i)
		// 		.then(function () {
		// 			console.log("Simulation finished!");
		// 			simulation.games[i].save();
		// 		});
		// 	})(i);
		// }

		// simulation.games[0] = games[0];
		// simulation.games[0].deck = decks[0];
		// simulation.runGame(0)
		// .then(function () {
		// 	console.log("Simulation finished!");
		// });

		// for (var i = 0; i < simulation.maxSimulations; i++) {
		// 	games[i].deck = decks[i];

		// 	(function(game, index) {
		// 		setInterval(function() {
		// 			if (game.current_round == 0) {
		// 				game.advanceGame();
		// 				simulation.gameStatus[index] = "Pending";
		// 				simulation.save();
		// 			}
		// 			else if (game.ai_players[0].selected_card && game.ai_players[1].selected_card && game.current_round <= game.max_rounds) {
		// 				game.advanceGame();
		// 			}
		// 			else if (game.current_round > game.max_rounds) {
		// 				console.log("Simulation " + index + " done!");
		// 				simulation.gameStatus[index] = "Complete";
		// 				simulation.save();
		// 				console.log(game.current_round);
		// 				var interval = this;
		// 				game.save()
		// 				.then(function () {
		// 					clearInterval(interval);
		// 				});
		// 				// clearInterval(this);
		// 			}

		// 		}, 10);
		// 	})(games[i], i);
		// }

		res.json({status: 'OK'});
	})
	// .spread(function (simulation, games) {
	// 	var gamePromise = Game.findById(simulation.games[0])
	// 	.populate([{
	// 		path: 'deck',
	// 		model: 'Deck'
	// 	},{
	// 		path: 'deck_type',
	// 		model: 'DeckType'
	// 	},{
	// 		path: 'ai_players',
	// 		populate: [{
	// 			path: 'user',
	// 			model: 'AIPlayer'
	// 		},{
	// 			path: 'hand',
	// 			model: 'Card'
	// 		},{
	// 			path: 'played_cards',
	// 			model: 'Card'
	// 		},{
	// 			path: 'selected_card',
	// 			model: 'Card'
	// 		}]
	// 	}]).execQ();

	// 	return [simulation, gamePromise];
	// })
	// .spread(function (simulation, games) {
	// 	var deckPromise = Deck.findById(game.deck._id).populate('cards').execQ();
	// 	// console.log(game.ai_players);

	// 	return [simulation, game, deckPromise];
	// })
	// .spread(function (simulation, game, deck) {
	// 	game.deck = deck;
	// 	// console.log(JSON.stringify(game));
	// 	// setTimeout(function () { game.advanceGame() }, 0);
	// 	setInterval(function () {
	// 		var canAdvance = true;
	// 		if (game.current_round == 0) {
	// 			game.advanceGame();
	// 		}
	// 		else if (game.ai_players[0].selected_card && game.ai_players[1].selected_card && game.current_round <= game.max_rounds) {
	// 			game.advanceGame();
	// 		}
	// 		else if (game.current_round > game.max_rounds) {
	// 			console.log("Simulation Done!");
	// 			clearInterval(this);
	// 		}
	// 	}, 50);
	// 	res.json(game);
	// })
	.catch(function (error) {
		console.log(error.stack);
		res.status(500).send(error);
	});
}

function getResults(req, res) {
	Simulation.findById(req.params.id)
	.populate('games').execQ()
	.then(function (simulation) {
		var results = {};
		results.scores = [];

		var successfulGames = [];
		simulation.games.forEach(function (game) {
			if (game.current_round > game.max_rounds) {
				successfulGames.push(game);
			}
		});

		var player1Wins = 0;
		var player2Wins = 0;
		var ties = 0;
		successfulGames.forEach(function (game) {
			results.scores.push({
				player1: game.ai_players[0].game_score,
				player2: game.ai_players[1].game_score
			});

			if (game.ai_players[0].game_score > game.ai_players[1].game_score) {
				player1Wins += 1;
			}
			else if (game.ai_players[0].game_score < game.ai_players[1].game_score) {
				player2Wins += 1;
			}
			else {
				ties += 1;
			}
		});

		results.player1Wins = player1Wins;
		results.player2Wins = player2Wins;
		results.ties = ties;

		if (player1Wins > player2Wins)
			results.winner = simulation.playerModel1;
		else if (player2Wins > player1Wins)
			results.winner = simulation.playerModel2;
		else
			results.winner = "";

		res.json(results);

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

router.get('/results/:id', getResults);