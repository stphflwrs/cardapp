var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
	
var GameSchema = new Schema({
	title			: {type: String, required: true},
	players			: [{type: Schema.ObjectId, ref: 'User'}],
	deck			: {type: Schema.ObjectId, ref: 'Deck'},
	deck_title		: {type: String}
});

module.exports = mongoose.model('Game', GameSchema);