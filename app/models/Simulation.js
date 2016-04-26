var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var SimulationSchema = new Schema({
	baseGame		: { type: Schema.ObjectId, ref: 'Game' },
	games			: [{ type: Schema.ObjectId, ref: 'Game' }],
	maxSimulations	: { type: Number, required: true },
	playerModel1	: { type: String },
	playerModel2	: { type: String }
});



mongoose.model('Simulation', SimulationSchema);