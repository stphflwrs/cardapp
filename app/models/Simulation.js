var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Q = require('q');

var SimulationSchema = new Schema({
	baseGame		: { type: Schema.ObjectId, ref: 'Game' },
	games			: [{ type: Schema.ObjectId, ref: 'Game' }],
	maxSimulations	: { type: Number, required: true },
	playerModel1	: { type: String },
	playerModel2	: { type: String }
});

SimulationSchema.methods.runGame = function (gameIndex) {
	var deferred = Q.defer();
	var simulation = this;

	var game = simulation.games[gameIndex];

	game.advanceGame();
	setInterval(function () {
		if (game.current_round > game.max_rounds) {
			deferred.resolve();
		}
		else if (game.ai_players[0].selected_card && game.ai_players[1].selected_card) {
			game.advanceGame();
		}
	}, 50);

	return deferred.promise;
}

mongoose.model('Simulation', SimulationSchema);