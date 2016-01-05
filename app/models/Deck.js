var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var DeckSchema = new Schema({
	cards			: [{type: Schema.ObjectId, ref: 'Card'}]
});

module.exports = mongoose.model('Deck', DeckSchema);