var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var StateSchema = new Schema({
	handHash			: { type: String },
	playedHash			: { type: String },
	actions				: [{
		encounters			: { type: Number },
		card				: { type: Schema.ObjectId, ref: 'Card' },
		reward				: { type: Number }
	}]
});

mongoose.model('State', StateSchema);