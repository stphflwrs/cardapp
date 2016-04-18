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
var BasicRLPlayerSchema =  new BaseSchema({
	username		: {type: String, default: "BasicRL"},
	states			: [{
		hand			: [{ type: Schema.ObjectId, ref: 'Card' }],
		played			: [{
			method			: String,
			label			: String,
			count			: Number
		}]
	}],
	actions			: [{
		card			: { type: Schema.ObjectId, ref: 'Card' },
		reward			: Number
	}],
	state_history	: [{ type: Number }]
});

RandomAIPlayerSchema.methods.selectCard = function (hand) {
	return Math.floor(Math.random() * hand.length);
};

ShortTermAIPlayerSchema.methods.selectCard = function (hand, playedCards, otherPlayedCards) {
	var Game = mongoose.model('Game');
	var Card = mongoose.model('Card');

	var largestScore = -1;
	var largestScoreIndex = -1;

	hand.forEach(function (card, index) {
		// Add card to hand
		var tempPlayedCards = playedCards.slice();
		tempPlayedCards.push(card);

		// Get what the score might be
		var score = Game.calculateScore(tempPlayedCards, otherPlayedCards, false);
		if (score > largestScore) {
			largestScore = score;
			largestScoreIndex = index;
		}
	});

	if (largestScore > 0) {
		return largestScoreIndex;
	}
	else {
		return { cardIndex: Math.floor(Math.random() * hand.length) };
	}

	
};

BasicRLPlayerSchema.methods.selectCard = function (hand, playedCards, otherPlayedCards, trainingMode) {
	var player = this;

	trainingMode = true;

	var sortedHand = sortHand(hand);
	var played = sortPlayed(generatePlayed(playedCards));

	var selectedIndex = Math.floor(Math.random() * sortedHand.length);
	player.states.push({
		hand: sortedHand,
		played: played
	});
	player.actions.push({
		card: sortedHand[selectedIndex],
		reward: 0
	});

	player.save();

	return hand.findIndex(function (element) {
		return element.label == sortedHand[selectedIndex].label;
	});

};

var AIPlayer = mongoose.model('AIPlayer', AIPlayerSchema);
var RandomAIPlayer = AIPlayer.discriminator('RandomAIPlayer', RandomAIPlayerSchema);
var ShortTermAIPlayer = AIPlayer.discriminator('ShortTermAIPlayer', ShortTermAIPlayerSchema);
var BasicRLPlayer = AIPlayer.discriminator('BasicRLPlayer', BasicRLPlayerSchema);


// Sorts return a new object
function sortHand(hand) {
	var newHand = Object.assign({}, hand);
	return hand.sort(function (a, b) {
		return a.label - b.label;
	});
}

function generatePlayed(playedCards) {
	var played = [];
	playedCards.forEach(function (card) {
		var values = card.value.split(":");
		var method = values[1];
		var label = values[2];

		if (method == 'tripler') {
			var triplerIndex = played.findIndex(function (element) {
				return (element.method == 'tripler' && element.label == label);
			});

			if (triplerIndex != -1) {
				played[triplerIndex].count++;
			}
			else {
				played.push({
					method: method,
					label: label,
					count: 1
				});
			}
		}
		else if (method == 'tripleafter') {
			var triplerIndex = played.findIndex(function (element) {
				return (element.method == 'tripler' && element.label == label);
			});

			if (triplerIndex != -1) {
				if (played[triplerIndex] > 0)
					played[triplerIndex].count--;
			}
		}
		else if (method == 'set') {
			var setSize = values[3];

			var setIndex = played.findIndex(function (element) {
				return (element.method == 'set' && element.label == label);
			});

			if (setIndex != -1) {
				played[setIndex].count++;
				if (played[setIndex] >= setSize)
					played[setIndex].count -= setSize;
			}
			else {
				played.push({
					method: method,
					label: label,
					count: 1
				});
			}
		}
		else if (method == 'count' || method == 'swapper' || method == 'mostleast' || method == 'most') {
			var pIndex = played.findIndex(function (element) {
				return (element.method == method && element.label == label);
			});

			if (pIndex != -1) {
				played[pIndex].count++;
			}
			else {
				played.push({
					method: method,
					label: label,
					count: 1
				});
			}
		}
	});

	return played;
}

function sortPlayed(played) {
	var newPlayed = Object.assign({}, played);
	return played.sort(function (a, b) {
		return a.label - b.label;
	});
}