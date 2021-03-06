var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Q = require('q');
	
var GameSchema = new Schema({
	title			: {type: String, required: true},
	players			: [{
		user			: {type: Schema.ObjectId, ref: 'User'},
		hand			: [{type: Schema.ObjectId, ref: 'Card'}],
		selected_card	: {type: Schema.ObjectId, ref: 'Card'},
		played_cards	: [{type: Schema.ObjectId, ref: 'Card'}],
		game_cards		: [{type: Schema.ObjectId, ref: 'Card'}],
		game_score		: {type: Number, default: 0},
		score			: {type: Number, default: 0}
	}],
	ai_players		: [{
		user			: {type: Schema.ObjectId, ref: 'AIPlayer'},
		hand			: [{type: Schema.ObjectId, ref: 'Card'}],
		selected_card	: {type: Schema.ObjectId, ref: 'Card'},
		played_cards	: [{type: Schema.ObjectId, ref: 'Card'}],
		game_cards		: [{type: Schema.ObjectId, ref: 'Card'}],
		game_score		: {type: Number, default: 0},
		score			: {type: Number, default: 0}
	}],
	hand_size		: {type: Number, default: 10},
	max_players		: {type: Number, default: 5},
	deck_type		: {type: Schema.ObjectId, ref: 'DeckType'},
	deck			: {type: Schema.ObjectId, ref: 'Deck'},
	deck_title		: {type: String},
	max_rounds		: {type: Number, default: 3},
	current_round	: {type: Number, default: 0},
	can_join		: {type: Boolean, default: true}
});

GameSchema.methods.playAI = function () {
	var game = this;
	game.ai_players.forEach(function (aiPlayer) {
		var othersCards = [];
		game.players.forEach(function (player) {
			othersCards = othersCards.concat([player.played_cards]);
		});
		game.ai_players.forEach(function (aiPlayer_) {
			if (!aiPlayer_._id.equals(aiPlayer._id)) {
				othersCards = othersCards.concat([aiPlayer_.played_cards]);
			}
		});

		// console.log(aiPlayer);
		(function (aiPlayer) {
			if (aiPlayer.hand.length + aiPlayer.played_cards.length == 10) {
				// if (aiPlayer.user.__t == "BasicRLPlayer") {
				// 	console.log("PLAYER\n======")
				// 	console.log(aiPlayer);
				// }
				game.playCard(aiPlayer.user._id, aiPlayer.user.selectCard(aiPlayer.hand, aiPlayer.played_cards, othersCards));
			}
		})(aiPlayer);
		// aiPlayer.user.save();
		// aiPlayer.user.selectCard(aiPlayer.hand, aiPlayer.played_cards, othersCards)
		// 	.then(function (result) {
		// 	console.log("Card Index Selected: " + result.cardIndex);

		// 	game.playCard(aiPlayer.user._id, result.cardIndex);
		// });
		// (function (aiPlayer) {
		// 	setTimeout(function () {
		// 		game.playCard(aiPlayer.user._id, aiPlayer.user.selectCard(aiPlayer.hand));
		// 	}, 0);
		// })(aiPlayer);
	});
	
	// game.save();
};

GameSchema.methods.advanceGame = function () {
	var game = this;
	if (game.canAdvanceTurn() && game.current_round > 0) {
		game.advanceTurn();

		// Score all human players (and those pretending to be human)		
		game.players.forEach(function (player) {
			// Determine players cards other than self
			var othersCards = [];
			game.players.forEach(function (player_) {
				if (!player_._id.equals(player._id)) {
					othersCards.push(player_.played_cards);
				}
			});
			game.ai_players.forEach(function (aiPlayer) {
				othersCards.push(aiPlayer.played_cards);
			});

			player.score = game.constructor.calculateScore(player.played_cards, othersCards);
		});
		
		// Score all AI Players
		game.ai_players.forEach(function (aiPlayer) {
			// Determine AI Players cards other than self (aware?)
			var othersCards = [];
			game.players.forEach(function (player) {
				othersCards.push(player.played_cards);
			});
			game.ai_players.forEach(function (aiPlayer_) {
				if (!aiPlayer_._id.equals(aiPlayer._id)) {
					othersCards.push(aiPlayer_.played_cards);
				}
			});

			// console.log(JSON.stringify(aiPlayer));
			aiPlayer.score = game.constructor.calculateScore(aiPlayer.played_cards, othersCards);
		});
	}
	
	if (game.canAdvanceRound()) {
		game.advanceRound();
	}
	
	game.save(function (err) {
		if (game.current_round <= game.max_rounds)
			game.playAI();
	});
};

GameSchema.methods.canAdvanceTurn = function () {
	var game = this;
	for (var i = 0; i < game.players.length; i++) {
		if (game.players[i].selected_card === undefined) {
			return false;
		}
	}
	for (var i = 0; i < game.ai_players.length; i++) {
		if (game.ai_players[i] === undefined) {
			return false;
		}
	}
	
	return true;
};

GameSchema.methods.canAdvanceRound = function () {
	var game = this;
	for (var i = 0; i < game.players.length; i++) {
		if (game.players[i].hand.length != 0) {
			return false;
		}
	}	
	for (var i = 0; i < game.ai_players.length; i++) {
		if (game.ai_players[i].hand.length != 0) {
			return false;
		}
	}
	
	return true;
};

GameSchema.methods.distributeHands = function () {
	var game = this;

	game.players.forEach(function (player) {
		player.hand = game.deck.cards.splice(0, game.hand_size);
	});
	game.ai_players.forEach(function (aiPlayer) {
		aiPlayer.hand = game.deck.cards.splice(0, game.hand_size);

// 		game.playCard(aiPlayer.user._id, aiPlayer.user.selectCard(aiPlayer.hand, aiPlayer.played_cards, othersCards));

		// (function (aiPlayer) {
		// 	setTimeout(function () {
		// 		game.playCard(aiPlayer.user._id, aiPlayer.user.selectCard(aiPlayer.hand));
		// 	}, 0);
		// })(aiPlayer);
	});
};

GameSchema.methods.playCard = function (playerID, cardIndex, swapperIndex, otherCardIndex) {
	var game = this;

	// Find the player based on ID
	var player = undefined;
	for (var i = 0; i < game.players.length; i++) {
		if (game.players[i].user._id.equals(playerID)) {
			player = game.players[i];
			break;
		}
	}
	for (var i = 0; i < game.ai_players.length; i++) {
		if (game.ai_players[i].user._id.equals(playerID)) {
			player = game.ai_players[i];
			break;
		}
	}

	if (swapperIndex) {
		var tempCard = {};
		tempCard = player.played_cards[swapperIndex];
		player.played_cards[swapperIndex] = player.hand[otherCardIndex];
		player.hand[otherCardIndex] = tempCard;
	}

	if (!player.selected_card) {
		player.selected_card = player.hand.splice(cardIndex, 1)[0];
	}
};

GameSchema.methods.advanceTurn = function () {
	var game = this;

	// Move selected card to played cards
	game.players.forEach(function (player, index, array) {
		player.played_cards = player.played_cards.concat(player.selected_card);
		player.selected_card = undefined;
	});
	game.ai_players.forEach(function (aiPlayer, index, array) {
		aiPlayer.played_cards = aiPlayer.played_cards.concat(aiPlayer.selected_card);
		aiPlayer.selected_card = undefined;
	});

	// Move hands to the next player
	if (game.players.length == 0)
		cycleHandsAIOnly();
	else if (game.ai_players == 0)
		cycleHandsHumanOnly();
	else
		cycleHandsMixed();

	// Begin AI selection
	game.ai_players.forEach(function (aiPlayer) {

		var othersCards = [];
		game.players.forEach(function (player) {
			othersCards.push(player.played_cards);
		});
		game.ai_players.forEach(function (aiPlayer_) {
			if (!aiPlayer_._id.equals(aiPlayer._id)) {
				othersCards.push(aiPlayer_.played_cards);
			}
		});

		// game.playCard(aiPlayer.user._id, aiPlayer.user.selectCard(aiPlayer.hand, aiPlayer.played_cards, othersCards));
		// var cardIndex = aiPlayer.user.selectCard(aiPlayer.hand, aiPlayer.played_cards, othersCards)
		// 	.then(function (result) {
		// 	console.log("Card Index Selected: " + result);

		// 	game.playCard(aiPlayer.user._id, result);
		// });
		// (function (aiPlayer) {
		// 	setTimeout(function () {
		// 		game.playCard(aiPlayer.user._id, aiPlayer.user.selectCard(aiPlayer.hand));
		// 	}, 0);
		// })(aiPlayer);
	});

	function cycleHandsHumanOnly() {
		var tempHand = game.players[0].hand;
		for (var i = 0; i < game.players.length; i++) {
			// Last player
			if (i == game.players.length - 1) {
				game.players[0].hand = tempHand;
			}
			else {
				var temp = game.players[i + 1].hand;
				game.players[i + 1].hand = tempHand;
				tempHand = temp;
			}
		}
	}

	function cycleHandsAIOnly() {
		var tempHand = game.ai_players[0].hand;
		for (var i = 0; i < game.ai_players.length; i++) {
			// Last player
			if (i == game.ai_players.length - 1) {
				game.ai_players[0].hand = tempHand;
			}
			else {
				var temp = game.ai_players[i + 1].hand;
				game.ai_players[i + 1].hand = tempHand;
				tempHand = temp;
			}
		}
	}

	function cycleHandsMixed() {
		var tempHand = game.players[0].hand;
		for (var i = 0; i < game.players.length; i++) {
			// Last player
			if (i == game.players.length - 1) {
				game.players[0].hand = tempHand;
			}
			else {
				var temp = game.players[i + 1].hand;
				game.players[i + 1].hand = tempHand;
				tempHand = temp;
			}
		}
		for (var i = 0; i < game.ai_players.length; i++) {
			// Last player
			if (i == game.ai_players.length - 1) {
				game.players[0].hand = game.ai_players[game.ai_players.length - 1].hand;
				game.ai_players[game.ai_players.length - 1].hand = tempHand;
			}
			else {
				var temp = game.ai_players[i + 1].hand;
				game.ai_players[i + 1].hand = tempHand;
				tempHand = temp;
			}
		}
	}
};

GameSchema.methods.advanceRound = function () {
	var game = this;
	// Empty played cards
	game.players.forEach(function (player, index, array) {
		player.played_cards.forEach(function (card) {
			// Move game scoring cards out
			var scoreType = card.value.split(":")[0];

			if (scoreType == "game") {
				player.game_cards = player.game_cards.concat(card);
			}
		});

		player.played_cards = [];
		player.game_score += player.score;
		player.score = 0;
	});
	game.ai_players.forEach(function (aiPlayer) {
		aiPlayer.played_cards.forEach(function (card) {
			// Move game scoring cards out
			var scoreType = card.value.split(":")[0];

			if (scoreType == "game") {
				aiPlayer.game_cards = aiPlayer.game_cards.concat(card);
			}
		});

		aiPlayer.played_cards = [];
		aiPlayer.game_score += aiPlayer.score;
		aiPlayer.score = 0;
	});

	// Check if last round
	game.current_round += 1;
	if (game.current_round <= game.max_rounds) {
		game.distributeHands();
		game.deck.save();
	}
	else {
		if (game.isSimulatation) {
			// Restart game and log result
			game.numSimulations += 1;
			game.current_round = 0;
			game.ai_players.forEach(function (aiPlayer) {
				aiPlayer.game_score = 0;
			});
			game.deck = game.deck_type.generateDeck();
			game.deck.shuffleDeck();
			game.save()
			.then(function () {
				if (game.numSimulations < game.maxSimulations)
					game.advanceGame();
			})
			.catch(function (err) {
				console.log(err);
			});
			
		}
	}
	
	game.save();
};

GameSchema.statics.calculateScore = function (playerCards, othersCards, gameOver) {

	// console.log(playerCards);
	// Calculates the points earned from set scoring cards of a label "setLabel"
	var calcSet = function (setLabel, cards) {
		var output = {
			points: 0,
			touchedCards: []
		};

		var setCards = 0;
		cards.forEach(function (card, index) {
			var params = card.value.split(":"),
				method = params[1];

			// We only care about sets
			if (method == "set") {

				var label = params[2],
					setSize = params[3],
					points = params[4];

				// We only care about a specific label
				if (label == setLabel) {
					setCards += 1;

					if (setCards == setSize) {
						output.points += parseInt(points);
						setCards = 0;
					}

					output.touchedCards.push(index);
				}
			}
		});

		return output;
	};

	// Calculates the points earned from count scoring cards of a label "countLabel"
	var calcCount = function (countLabel, cards) {
		var output = {
			points: 0,
			touchedCards: []
		};

		var countCards = 0;
		cards.forEach(function (card, index) {
			var params = card.value.split(":"),
				method = params[1];

			// We only care about counts
			if (method == "count") {
				var label = params[2],
					countValues = params.slice(3);

				// We only care about a specific label
				if (label == countLabel) {
					countCards += 1;
					if (countCards < countValues.length) {
						output.points = parseInt(countValues[countCards - 1]);
					}
					else {
						output.points = parseInt(countValues[countValues.length - 1]);
					}

					output.touchedCards.push(index);
				}
			}
		});

		return output;
	};

	var calcTripleAfter = function (triplerLabel, cards) {
		var output = {
			points: 0,
			touchedCards: []
		};

		var triplerCards = 0;
		cards.forEach(function (card, index) {
			var params = card.value.split(":"),
				method = params[1];

			// We only care about triplers and tripleafters
			if (method == "tripler") {
				var label = params[2];

				// Keep track of number of triplers in play
				if (label == triplerLabel) {
					triplerCards += 1;
					output.touchedCards.push(index);
				}
			}
			else if (method == "tripleafter") {
				var label = params[2],
					points = params[3];

				// If triplers in play, apply the triple. Otherwise score without
				if (label == triplerLabel) {
					if (triplerCards > 0) {
						output.points += parseInt(points) * 3;
						triplerCards -= 1;
					}
					else {
						output.points += parseInt(points);
					}

					output.touchedCards.push(index);
				}
			}
		});

		return output;
	};

	var calcMost = function (mostLabel, cards, opponentsCards) {
		var output = {
			points: 0,
			touchedCards: []
		};

		var mostPoints = 0;
		var secondMostPoints = 0;

		var myTotal = 0;

		// Go through my cards
		cards.forEach(function (card, index) {
			var params = card.value.split(":"),
				method = params[1];

			// Only care about mosts
			if (method == "most") {
				var label = params[2];

				if (label == mostLabel) {
					var amount = params[3];
					mostPoints = parseInt(params[4]);
					secondMostPoints = parseInt(params[5]);

					myTotal += parseInt(amount);

					output.touchedCards.push(index);
				}
			}
		});

		var theirTotals = [];

		// Go through opponents cards
		opponentsCards.forEach(function (opponentCards) {

			var opponentTotal = 0;
			opponentCards.forEach(function (card) {
				var params = card.value.split(":"),
					method = params[1];

				if (method == "most") {
					var label = params[2];

					if (label == mostLabel) {
						var amount = params[3];

						opponentTotal += parseInt(amount);
					}
				}
			});

			theirTotals.push(opponentTotal);
		});

		// Sort opponent totals DESC
		theirTotals.sort(function (a, b) {
			return b - a;
		});

		// Determine point distribution
		// If more than the most:
		if (myTotal > theirTotals[0]) {
			output.points = parseInt(mostPoints);
		}
		// If I'm tied for first:
		else if (myTotal == theirTotals[0]) {
			// See how many I have to share with
			var numWinners = 2;
			for (var i = 1; i < theirTotals.length; i++) {
				if (myTotal == theirTotals[1]) {
					numWinners++;
					continue;
				}
				else {
					break;
				}
			}

			// Divide fairly, rounded down
			output.points = Math.floor(parseInt(mostPoints) / numWinners);
		}
		// I do not have the most:
		else {
			// Check if there's a tie for first:
			if (theirTotals.length > 1 && theirTotals[0] == theirTotals[1]) {
				// This means I (and nobody else, but I don't care about them) don't any slice of the cake
			}
			// No tie, check if I got second:
			else if (!theirTotals[1] || myTotal > theirTotals[1]) {
				output.points = parseInt(secondMostPoints);
			}
			// Tied for second:
			else if (myTotal == theirTotals[1]) {
				var numFirstLosers = 2;

				// See how many I tied with
				for (var i = 2; i < theirTotals.length; i++) {
					if (myTotal == theirTotals[i]) {
						numFirstLosers += 1;
						continue;
					}
					else {
						break;
					}
				}

				output.points = Math.floor(parseInt(secondMostPoints) / numFirstLosers);
			}
		}

		return output;
	};

	var calcMostLeast = function (mostLeastLabel, cards, opponentsCards, defaultMostPoints, defaultLeastPoints) {
		var output = {
			points: 0,
			touchedCards: []
		};

		var mostPoints = 0;
		var leastPoints = 0;

		// If parameters are preset, do this
		if (defaultMostPoints) mostPoints = defaultMostPoints;
		if (defaultLeastPoints) leastPoints = defaultLeastPoints;

		var myTotal = 0;

		// Check out my own cards
		cards.forEach(function (card, index) {
			var params = card.value.split(":"),
				method = params[1];

			// Only care about mosts
			if (method == "mostleast") {
				var label = params[2];

				if (label == mostLeastLabel) {
					myTotal += 1;

					output.touchedCards.push(index);
				}
			}
		});

		var theirTotals = [];

		// Check out their cards
		opponentsCards.forEach(function (opponentCards) {

			var opponentTotal = 0;
			opponentCards.forEach(function (card) {
				var params = card.value.split(":"),
					method = params[1];

				if (method == "mostleast") {
					var label = params[2];

					if (label == mostLeastLabel) {
						opponentTotal += 1;
					}
				}
			});

			theirTotals.push(opponentTotal);
		});

		// Sort ASC
		theirTotals.sort();

		// Determine points
		// If I have the most:
		if (myTotal > theirTotals[theirTotals.length - 1]) {
			output.points = mostPoints;
		}
		// If I tied for most:
		else if (myTotal == theirTotals[theirTotals.length - 1]) {
			var numWinners = 2;

			// Determine how many ties
			for (var i = theirTotals.length - 2; i >= 0; i--) {
				if (myTotal	== theirTotals[i]) {
					numWinners++;
					continue;
				}
				else {
					break;
				}
			}

			// Only award points if not everyone has same amount
			if (numWinners != theirTotals.length + 1) {
				output.points = Math.floor(mostPoints / numWinners);
			}
		}
		// If I have the least ;-;:
		else if (myTotal < theirTotals[0]) {
			output.points = leastPoints;
		}
		// If I tied for the least:
		else if (myTotal == theirTotals[0]) {
			var numLosers = 2;

			// Determine how many ties
			for (var i = 1; i < theirTotals.length; i++) {
				if (myTotal == theirTotals[i]) {
					numLosers++;
					continue;
				}
				else {
					break;
				}
			}

			output.points = Math.flor(leastPoints / numLosers);
		}

		return output;
	};

	// Actual non-function stuff here!!!
	var score = 0;
	score += calcSet("tempura", playerCards).points;
	score += calcSet("sashimi", playerCards).points;
	score += calcCount("dumpling", playerCards).points;
	score += calcTripleAfter("wasabi", playerCards).points;
	if (othersCards) {
		score += calcMost("maki", playerCards, othersCards).points;
	}

	if (gameOver) {
		score += calcMostLeast("pudding", playerCards, othersCards).points;
	}

	return score;
};


module.exports = mongoose.model('Game', GameSchema);