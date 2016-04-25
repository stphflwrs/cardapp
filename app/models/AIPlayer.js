var mongoose = require('mongoose'),
	util = require('util'),
	Schema = mongoose.Schema,
	Q = require('q'),
	hash = require('object-hash');

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
		}],
		hand_hash		: String,
		played_hash		: String
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
	// console.log(JSON.stringify(sortedHand.toObject()));
	var handHash = hash(JSON.stringify(sortedHand.toObject()));
	var playedHash = hash(JSON.stringify(played));
	// console.log(hash(sortedHand.toObject()));

	var stateIndex = player.states.findIndex(function (state) {
		return (state.hand_hash == handHash && state.playedHash == playedHash);
	});

	var selectedIndex = -1;
	// Add new state entry
	if (stateIndex == -1) {
		selectedIndex = Math.floor(Math.random() * sortedHand.length);
		player.states.push({
			hand: sortedHand,
			played: played,
			hand_hash: handHash,
			played_hash: playedHash
		});
		player.actions.push({
			card: sortedHand[selectedIndex],
			reward: 0
		});
		player.state_history = player.states.length - 1;

		player.save()
		.then(function () {
			return hand.findIndex(function (element) {
				return element.label == sortedHand[selectedIndex].label;
			});
		});
	}
	// State already happened
	else {
		console.log("Hey woah");
		throw "WOAH";
	}

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
				if (played[setIndex].count >= setSize)
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
		else if (method == 'most') {
			var mostValue = values[3];

			var mostIndex = played.findIndex(function (element) {
				return (element.method == 'most' && element.label == label);
			});

			if (mostIndex != -1) {
				played[setIndex] += mostValue;
			}
			else {
				played.push({
					method: method,
					label: label,
					count: mostValue
				});
			}
		}
		else if (method == 'count' || method == 'swapper' || method == 'mostleast') {
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