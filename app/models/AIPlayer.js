var mongoose = require('mongoose'),
	util = require('util'),
	Schema = mongoose.Schema;

var BaseSchema = function () {
	Schema.apply(this, arguments);

	this.add({
	});
};
util.inherits(BaseSchema, Schema);

var AIPlayerSchema = new BaseSchema();
var RandomAIPlayerSchema = new BaseSchema({
	username		: {type: String, default: "RandomAI"}
});
var ShortTermAIPlayerSchema = new BaseSchema({
	username		: {type: String, default: "ShortTermAI"}
});

RandomAIPlayerSchema.methods.selectCard = function (hand) {
	return Math.floor(Math.random() * hand.length);
};

ShortTermAIPlayerSchema.methods.selectCard = function (hand, playedCards, otherPlayedCards) {
	var Game = mongoose.model('Game');
	var Card = mongoose.model('Card');

	var largestScore = -1;
	var largestScoreIndex = -1;

	Card.find({
		'_id': { $in: hand }
	}).exec(function (err, cards) {
		console.log("Cards: " + cards);

		hand.forEach(function (card, index) {
			var tempPlayedCards = playedCards.slice();
			tempPlayedCards.push(card);

			var score = Game.calculateScore(tempPlayedCards, otherPlayedCards);
			if (score > largestScore) {
				largestScore = score;
				largestScoreIndex = index;
			}
		});

		if (largestScore > 0) {
			return largestScoreIndex;
		}
		else {
			return Math.floor(Math.random() * hand.length);
		}
	});

	
};

var AIPlayer = mongoose.model('AIPlayer', AIPlayerSchema);
var RandomAIPlayer = AIPlayer.discriminator('RandomAIPlayer', RandomAIPlayerSchema);
var ShortTermAIPlayer = AIPlayer.discriminator('ShortTermAIPlayer', ShortTermAIPlayerSchema);
