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


DeckTypeSchema.virtual('num_cards')
    .get(function() {
        var total = "ABD";
        // for (var card in this.cards) {
        //     total += card.count;
        // }

        return total;
    });

mongoose.model('DeckType', DeckTypeSchema);

