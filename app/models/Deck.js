var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var DeckSchema = new Schema({
	deck_type		: {type: Schema.ObjectId, ref: 'DeckType'},
	cards			: [{type: Schema.ObjectId, ref: 'Card'}]
});

DeckSchema.methods.shuffleDeck = function () {
	for (var i = 0; i < this.cards.length; i++) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = this.cards[i];
        this.cards[i] = this.cards[j];
        this.cards[j] = temp;
	}
};

DeckSchema.methods.drawCard = function () {
	return this.cards[0];
};

DeckSchema.methods.drawCards = function (numCards) {
	var output = [];
	for (var i = 0; i < numCards; i++) {
		output.push(cards.pop());
	}

	return output;
};

module.exports = mongoose.model('Deck', DeckSchema);