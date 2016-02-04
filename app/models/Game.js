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
		player.hand = game.deck.cards.splice(0, 1);
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

	console.log(player);
	console.log(cardIndex);

	player.selected_card = player.hand.splice(cardIndex, 1)[0];
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

		player.played_cards = [];
	});

	// Check if last round
	game.current_round += 1;
	if (game.current_round <= game.max_rounds) {
		game.distributeHands();
	}
};

module.exports = mongoose.model('Game', GameSchema);