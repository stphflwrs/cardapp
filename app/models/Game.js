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
	deck			: {type: Schema.ObjectId, ref: 'Deck'},
	deck_title		: {type: String},
	max_rounds		: {type: Number, default: 3},
	current_round	: {type: Number, default: 0},
	can_join		: {type: Boolean, default: true}
});

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
	// Empty played cards
	this.players.forEach(function (player, index, array) {
		// Score game first

		player.played_cards = [];
	});

	// Check if last round
	this.current_round += 1;
	if (this.current_round < this.max_rounds) {
		// Distribute new cards
		var Deck = mongoose.model('Deck');
		Deck.findById(this.deck).populate('cards').exec(function (err, deck) {
			if (err)
				throw err;

			if (!deck)
				return false;

			console.log(this);

			
		}).then(function (deck) {
			this.players.forEach(function (player, index, array) {
				player.hand = deck.cards.splice(0, this.hand_size);
			});

			deck.save(function (err) {
				if (err)
					throw err;
			});
		});

		
	}
};

module.exports = mongoose.model('Game', GameSchema);