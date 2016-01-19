var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    relationship = require('mongoose-relationship');

var DeckTypeSchema = new Schema({
    label           : String,
    description     : String,
    cards           : [{
        card           : {type: Schema.ObjectId, ref: 'Card' },
        amount         : Number
    }],
    image_url       : String
});


DeckTypeSchema.methods.generateDeck = function () {
    var cards = [];

    for (var i = 0; i < this.cards.length; i++) {
        for (var j = 0; j < this.cards[i].amount; j++) {
            cards = cards.concat(this.cards[i].card);
        }
    }

    return cards;
};

mongoose.model('DeckType', DeckTypeSchema);

