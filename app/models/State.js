var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var StateSchema = new Schema({
	encounters			: { type: Number },
	handHash			: { type: String },
	playedHash			: { type: String },
	// hand				: [ { type: Schema.ObjectId, ref: 'Card' }],
	// played				: [ { type: Schema.ObjectId, ref: 'Card' }],
	actions				: [{
		encounters			: { type: Number },
		card				: { type: Schema.ObjectId, ref: 'Card' },
		reward				: { type: Number }
	}],
	lastActionIndex		: Number
});

mongoose.model('State', StateSchema);