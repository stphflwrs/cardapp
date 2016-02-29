var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
	
var GameSchema = new Schema({
	title			: {type: String, required: true},
	players			: [{
		user			: {type: Schema.ObjectId, ref: 'User'},
		hand			: [{type: Schema.ObjectId, ref: 'Card'}],
		selected_card	: {type: Schema.ObjectId, ref: 'Card'},
		played_cards	: [{type: Schema.ObjectId, ref: 'Card'}],
		score			: {type: Number, default: 0}
	}],
	ai_players		: [{
		user			: {type: Schema.ObjectId, ref: 'AIPlayer'},
		hand			: [{type: Schema.ObjectId, ref: 'Card'}],
		selected_card	: {type: Schema.ObjectId, ref: 'Card'},
		played_cards	: [{type: Schema.ObjectId, ref: 'Card'}],
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

GameSchema.methods.distributeHands = function () {
	var game = this;
	game.players.forEach(function (player) {
		player.hand = game.deck.cards.splice(0, game.hand_size);
	});
	game.ai_players.forEach(function (aiPlayer) {
		aiPlayer.hand = game.deck.cards.splice(0, game.hand_size);
		(function (aiPlayer) {
			setTimeout(function () {
				game.playCard(aiPlayer.user._id, aiPlayer.user.selectCard(aiPlayer.hand));
			}, 0);
		})(aiPlayer);
	});
};

GameSchema.methods.playCard = function (playerID, cardIndex) {
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

	if (!player.selected_card) {
		player.selected_card = player.hand.splice(cardIndex, 1)[0];
	}
};

GameSchema.methods.advanceTurn = function () {
	var game = this;

	// Move selected card to played cards
	game.players.forEach(function (player, index, array) {
		player.played_cards.push(player.selected_card);
		player.selected_card = undefined;
	});
	game.ai_players.forEach(function (aiPlayer, index, array) {
		aiPlayer.played_cards.push(aiPlayer.selected_card);
		aiPlayer.selected_card = undefined;
	});

	// Move hands to the next player
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

	// Begin AI selection
	game.ai_players.forEach(function (aiPlayer) {
		game.playCard(aiPlayer.user._id, aiPlayer.user.selectCard(aiPlayer.hand));
		// (function (aiPlayer) {
		// 	setTimeout(function () {
		// 		game.playCard(aiPlayer.user._id, aiPlayer.user.selectCard(aiPlayer.hand));
		// 	}, 0);
		// })(aiPlayer);
	});
};

GameSchema.methods.advanceRound = function () {
	var game = this;
	// Empty played cards
	game.players.forEach(function (player, index, array) {
		player.played_cards = [];
	});
	game.ai_players.forEach(function (aiPlayer) {
		aiPlayer.played_cards = [];
	});

	// Check if last round
	game.current_round += 1;
	if (game.current_round <= game.max_rounds) {
		game.distributeHands();
	}
};

GameSchema.methods.updateScores = function () {
	var game = this;

	var roundData = {};
	game.players.forEach(function (player, index) {
		var playerData = {};
		player.played_cards.forEach(function (card, index) {
			var cardValueParams = card.value.split(":");
			var cardValue = {
				period: cardValueParams[0],
				method: cardValueParams[1],
				params: cardValueParams.slice(2)
			};

			if (cardValue.period == "round") {
				if (cardValue.method == "set") {
					// Initialize set data if necessary
					if (!playerData.sets) {
						playerData.sets = {};
					}

					// Adds card to set or initializes
					if (!playerData.sets[cardValue.params[0]]) {
						playerData.sets[cardValue.params[0]] = 1;
					}
					else {
						playerData.sets[cardValue.params[0]] += 1;
					}

					// Checks for a completed set
					if (playerData.sets[cardValue.params[0]] == cardValue.params[1]) {
						playerData.sets[cardValue.params[0]] = 0;
						player.score += parseInt(cardValue.params[2]);
					}
				}
				else if (cardValue.method == "tripler") {
					// Initialize tripler data if necessary
					if (!playerData.tripler) {
						playerData.tripler = {};
					}

					playerData.tripler[cardValue.params[0]] = 1;
					player.score += parseInt(cardValue.params[1]);
				}
				else if (cardValue.method == "tripleafter") {
					if (playerData.tripler) {
						if (playerData.tripler[cardValue.params[0]]) {
							player.score += parseInt(cardValue.params[1]) * 3;
							delete playerData.tripler[cardValue.params[0]];
						}
						else {
							player.score += parseInt(cardValue.params[1]);
						}
					}
					else {
						player.score += parseInt(cardValue.params[1]);
					}
				}
				else if (cardValue.method == "count") {
					if (!playerData.count) {
						playerData.count = {};
					}

					// Add card to counts
					if (!playerData.count[cardValue.params[0]]) {
						playerData.count[cardValue.params[0]] = 1;
					}
					else {
						playerData.count[cardValue.params[0]] += 1;
					}

					if (playerData.count[cardValue.params[0]] < cardValue.params.length - 1) {
						console.log("Score value for " + playerData.count[cardValue.params[0]]);
						player.score -= parseInt(cardValue.params[playerData.count[cardValue.params[0]] - 1]);
						player.score += parseInt(cardValue.params[playerData.count[cardValue.params[0]]]);
					}
					else if (playerData.count[cardValue.params[0]] == cardValue.params.length - 1) {
						player.score += parseInt(cardValue.params[cardValue.params.length - 2]);
						player.score += parseInt(cardValue.params[cardValue.params.length - 1]);
					}
				}
				else if (cardValue.method == "most") {
					if (!roundData.most) {
						roundData.most = {};
					}

					if (!roundData.most[player.user._id]) {
						roundData.most[player.user._id] = {};
					}

					// Assign points
					if (!roundData.most[player.user._id][cardValue.params[0]]) {
						roundData.most[player.user._id][cardValue.params[0]] = parseInt(cardValue.params[1]);
					}
					else {
						roundData.most[player.user._id][cardValue.params[0]] += parseInt(cardValue.params[1]);
					}

				}
			}
		});
	});

	// Check for having the most points in category "most"
	// - Track player(s) who have the most and second most
	// - Check if someone has equal points or more points to player(s) who have the most
	// --- If equal, concat with player list
	// --- If more, replace list with just that player, then assign old list to second most
	// --- If less, check if equal with second most list
	// - If current player in the list, assign points / size of that list (floored)
	// - If second most list >= 1 and most list == 1, assign second most points / size of that list (floored)
	// var firstMost = {};
	// var secondMost = {};

	// // Find player with least score first
	// var leastPlayer = undefined;
	// for (var currentPlayer in roundData.most) {
	// 	if (!leastPlayer) {
	// 		leastPlayer = currentPlayer;
	// 	}
	// 	else {
	// 		if (roundData.most[currentPlayer]["maki"] < roundData.most[leastPlayer]["maki"]) {
	// 			leastPlayer = currentPlayer;
	// 		}
	// 	}
	// }

	// // Now check for most
	// firstMost[leastPlayer] = roundData.most[leastPlayer]["maki"];
	// for (var currentPlayer in roundData.most) {
	// 	var someFirstPlayer = Object.keys(firstMost)[0];
	// 	if (roundData.most[currentPlayer]["maki"] == roundData.most[someFirstPlayer]["maki"]) {
	// 		firstMost[currentPlayer] = roundData.most[currentPlayer]["maki"];
	// 	}
	// 	else if (roundData.most[currentPlayer]["maki"] > roundData.most[someFirstPlayer]["maki"]) {
			
	// 	}
	// }

};

module.exports = mongoose.model('Game', GameSchema);