var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
	
var GameSchema = new Schema({
	title			: String,
	players			: [{type: Schema.ObjectId, ref: 'User'}],
	deck			: {type: Schema.ObjectId, ref: 'Deck'}
});

modules.exports = mongoose.model('Game', GameSchema);