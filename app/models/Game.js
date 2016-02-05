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
		// Score game first
		var scoreData = {};
		player.played_cards.forEach(function (card) {
			console.log(card);
			var cardValueParams = card.value.split(":");
			var cardValue = {
				period: cardValueParams[0],
				method: cardValueParams[1],
				params: cardValueParams.slice(2)
			};

			if (cardValue.period == "game" && current_round == max_rounds) {
				// Score endgame cards
			}
			else if (cardValue.period == "round") {
				// Always score these cards
				if (cardValue.method == "set") {
					// Initialize if necessary
					if (!scoreData.sets) {
						scoreData.sets = {};
					}

					// Initialize or increment count of a set
					if (!scoreData.sets[cardValue.params[0]]) {
						scoreData.sets[cardValue.params[0]] = 1;
					}
					else {
						scoreData.sets[cardValue.params[0]] += 1;
					}

					// Check if a set is completed
					if (scoreData.sets[cardValue.params[0]]) {
						if (scoreData.sets[cardValue.params[0]] == cardValue.params[1]) {
							scoreData.sets[cardValue.params[0]] = 0;
							player.score += cardValue.params[2];
							console.log("Player score now: " + player.score);
						}
					}
				}
				else if (cardValue.method == "count") {

				}
				else if (cardValue.method == "most") {

				}
				else if (cardValue.method == "tripler") {

				}
				else if (cardValue.method == "tripleafter") {

				}
				else if (cardValue.method == "swap") {

				}
			}
		});

		player.played_cards = [];
	});

	// Check if last round
	game.current_round += 1;
	if (game.current_round <= game.max_rounds) {
		game.distributeHands();
	}
};

module.exports = mongoose.model('Game', GameSchema);