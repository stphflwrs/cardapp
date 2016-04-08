var mongoose = require('mongoose'),
	util = require('util'),
	Schema = mongoose.Schema,
	Q = require('q');

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
	
	console.log(hand);
	console.log(playedCards);
	console.log(otherPlayedCards);
	
	/* var promises = [];
	// promises.push(Q(Card.find({'_id': {$in: hand}}).exec()));
	hand.forEach(function (card) {
		promises.push(Q(Card.findById(card).exec()));
	});
	// promises.push(Q(Card.find({'_id': {$in: playedCards}}).exec()));
	playedCards.forEach(function (card) {
		promises.push(Q(Card.findById(card).exec()));
	});
	otherPlayedCards.forEach(function (oppPlayedCards) {
		// promises.push(Q(Card.find({'_id': {$in: oppPlayedCards}}).exec()));
		oppPlayedCards.forEach(function (card) {
			promises.push(Q(Card.findById(card).exec()));
		});
	});

	Q.all(promises).then(function (results) {
// 		console.log("Cards: " + results);
// 		console.log(hand.length);
		hand = results.slice(0, hand.length + 1);
// 		console.log(hand);
// 		console.log(playedCards.length);
		playedCards = results.slice(hand.length + 1, hand.length + playedCards.length + 1);
// 		console.log(playedCards);
		// otherPlayedCards = results.slice(2);
		for (var i = 0; i < otherPlayedCards.length; i++) {
			otherPlayedCards[i] = results.slice(hand.length + playedCards.length + playedCards.length * i, hand.length + playedCards.length + playedCards.length * (i+1));
		} */

		hand.forEach(function (card, index) {
			var tempPlayedCards = playedCards.slice();
			tempPlayedCards.push(card);

			var score = Game.calculateScore(tempPlayedCards, otherPlayedCards, false);
// 			console.log(tempPlayedCards);
// 			console.log(score);
			if (score > largestScore) {
				largestScore = score;
				largestScoreIndex = index;
			}
		});

		if (largestScore > 0) {
// 			console.log(largestScoreIndex);
// 			console.log(largestScore);
// 			console.log(hand[largestScoreIndex]);
			return largestScoreIndex;
		}
		else {
			return Math.floor(Math.random() * hand.length);
		}
// 	});

	
};

var AIPlayer = mongoose.model('AIPlayer', AIPlayerSchema);
var RandomAIPlayer = AIPlayer.discriminator('RandomAIPlayer', RandomAIPlayerSchema);
var ShortTermAIPlayer = AIPlayer.discriminator('ShortTermAIPlayer', ShortTermAIPlayerSchema);
