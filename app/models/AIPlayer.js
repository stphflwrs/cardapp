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
	// states			: [{
	// 	encounters		: { type: Number, default: 0 },
	// 	// hand			: [{ type: Schema.ObjectId, ref: 'Card' }],
	// 	// played			: [{
	// 	// 	method			: String,
	// 	// 	label			: String,
	// 	// 	count			: Number
	// 	// }],
	// 	hand_hash		: String,
	// 	played_hash		: String,
	// 	actions			: [{
	// 		encounters		: { type: Number, default: 0 },
	// 		card			: { type: Schema.ObjectId, ref: 'Card' },
	// 		reward			: Number
	// 	}]
	// }],
	// state_history	: [{ type: Number }]
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
	var State = mongoose.model('State');
	var player = this;

	trainingMode = true;

	var sortedHand = sortHand(hand);
	var played = sortPlayed(generatePlayed(playedCards));
	var handHash = hash(JSON.stringify(sortedHand.toObject()));
	var playedHash = hash(JSON.stringify(played));

	// Find the state...possibly
	// var stateIndex = player.states.findIndex(function (state) {
	// 	return (state.hand_hash == handHash && state.playedHash == playedHash);
	// });

	State.findOne({
		handHash: handHash,
		playedHash: playedHash
	}).populate('actions.card').exec()
	.then(callback)
	.catch(function (error) {
		console.log(error.stack);
	});

	function callback(state) {
		var selectedIndex = Math.floor(Math.random() * sortedHand.length);
		console.log(state);
		if (state == null) {
			// selectedIndex = Math.floor(Math.random() * sortedHand.length);

			var action = {
				encounters: 1,
				card: sortedHand[selectedIndex],
				reward: 0
			};

			state = {
				encounters: 1,
				// hand: sortedHand,
				// played: played,
				handHash: handHash,
				playedHash: playedHash,
				actions: []
			};

			state.actions.push(action);
			// stateIndex = player.states.length;

			// console.log(state);
			// player.states.push(state);
			// player.state_history.push(stateIndex);

			// Save to database
			var stateDoc = new State(state);
			stateDoc.save();
		}
		else {
			console.log("State encountered before!");
			console.log(sortedHand);
			console.log(played);

			// var state = player.states[stateIndex];
			state.encounters += 1;

			var actionIndex = state.actions.findIndex(function (action) {
				return action.card == sortedHand[selectedIndex];
			});

			var action = {};
			if (actionIndex == -1) {
				action.card = {
					encounters: 1,
					card: sortedHand[selectedIndex],
					reward: 0
				};

				actionIndex = state.actions.length;
			}
			else {
				action = state.actions[actionIndex];
				action.encounters += 1;
			}

			state.actions[actionIndex] = action;
			// player.states[stateIndex] = state;
			state.save();
		}

		// player.state_history.push(stateIndex);

		return hand.findIndex(function (card) {
			return card.value == sortedHand[selectedIndex].value;
		});
	}

	// var selectedIndex = -1;
	// // Add new state entry
	// if (stateIndex == -1) {
	// 	selectedIndex = Math.floor(Math.random() * sortedHand.length);

	// 	var action = {
	// 		card: sortedHand[selectedIndex],
	// 		reward: 0
	// 	};

	// 	player.states.push({
	// 		hand: sortedHand,
	// 		played: played,
	// 		hand_hash: handHash,
	// 		played_hash: playedHash
	// 	});
	// 	player.states[player.states.length - 1].actions.push(action);
	// 	player.state_history.push(player.states.length - 1);

	// 	return hand.findIndex(function (element) {
	// 		return element.label == sortedHand[selectedIndex].label;
	// 	});
	// 	// player.save();
	// 	// .then(function () {
	// 		// return hand.findIndex(function (element) {
	// 		// 	return element.label == sortedHand[selectedIndex].label;
	// 		// });
	// 	// });
	// }
	// // State already happened
	// else {
	// 	console.log('State already happened');
	// 	selectedIndex = Math.floor(Math.random() * sortedHand.length);

	// 	var state = player.states[stateIndex];
	// 	state.encounters += 1;

	// 	var action = {
	// 		card: sortedHand[selectedIndex],
	// 		reward: 0
	// 	};

	// 	state.actions.push(action);
	// 	player.state_history.push(stateIndex);


	// 	return hand.findIndex(function (element) {
	// 		return element.label == sortHand[selectedIndex].label;
	// 	});
	// 	// player.save();
	// 	// .then(function () {
	// 	// 	return hand.findIndex(function (element) {
	// 	// 		return element.label == sortHand[selectedIndex].label;
	// 	// 	});
	// 	// });
	// }

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