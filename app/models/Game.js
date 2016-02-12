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

	if (!player.selected_card) {
		player.selected_card = player.hand.splice(cardIndex, 1)[0];
	}
};

GameSchema.methods.advanceTurn = function () {
	// Move selected card to played cards
	this.players.forEach(function (player, index, array) {
		player.played_cards.push(player.selected_card);
		player.selected_card = undefined;
	});

	// Move hands to the next player
	var tempHand = this.players[0].hand;
	for (var i = 0; i < this.players.length; i++) {
		// Last player
		if (i == this.players.length - 1) {
			this.players[0].hand = tempHand;
		}
		else {
			var temp = this.players[i + 1].hand;
			this.players[i + 1].hand = tempHand;
			tempHand = temp;
		}
	}
};

GameSchema.methods.advanceRound = function () {
	var game = this;
	// Empty played cards
	game.players.forEach(function (player, index, array) {
		player.played_cards = [];
	});

	// Check if last round
	game.current_round += 1;
	if (game.current_round <= game.max_rounds) {
		game.distributeHands();
	}
};

GameSchema.methods.updateScores = function () {
	var game = this;

	game.players.forEach(function (player, index) {
		var playerData = {};
		player.played_cards.forEach(function (card, index) {
			var cardValueParams = card.value.split(":");
			var cardValue = {
				period: cardValueParams[0],
				method: cardValueParams[1],
				params: cardValueParams.slice[2]
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
						player.score += cardValue.params[2];
					}
				}
			}
		});
	});
};

module.exports = mongoose.model('Game', GameSchema);