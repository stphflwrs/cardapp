var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CardSchema = new Schema({
    label           : String,
    description     : String,
    value           : String,
    image_url       : String
});

module.exports = mongoose.model('Card', CardSchema);

