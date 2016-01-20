var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
	
var GameSchema = new Schema({
	title			: {type: String, required: true},
	players			: [{
		user			: {type: Schema.ObjectId, ref: 'User'},
		hand			: [{type: Schema.ObjectId, ref: 'Card'}],
		score			: {type: Number}
	}],
	deck			: {type: Schema.ObjectId, ref: 'Deck'},
	deck_title		: {type: String}
});

module.exports = mongoose.model('Game', GameSchema);