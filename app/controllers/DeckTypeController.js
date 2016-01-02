var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    DeckType = mongoose.model('DeckType');

module.exports = function (app) {
    app.use('/api/deck_types', router);
};

// Retrieve all cards
router.get('/', function(req, res) {
    DeckType.find(function(err, cards) {
        if (err) res.send(err);

        else res.json(cards);
    });
});

// Create new card
router.post('/create', function(req, res) {
    var deckType = new DeckType(req.body);

    deckType.save(function(err) {
        if (err) res.send(err);

        else res.json(deckType);
    });
});

// // Retrieve card with id
// router.get('/retrieve/:deck_type_id', function(req, res) {
//     DeckType.findById(req.params.deck_type_id, function(err, deckType) {
//         if (err) res.send(err);

//         else res.json(deckType);
//     });
// });

// Retrieve card with id
router.get('/retrieve/:deck_type_id', function(req, res) {
    DeckType.findById(req.params.deck_type_id).populate('cards.card').exec(function(err, deckType) {
        if (err) res.send(err);

        else res.json(deckType);
    });
});

// Update card with id
router.put('/update/:deck_type_id', function(req, res) {
    DeckType.findById(req.params.deck_type_id, function(err, deckType) {
        if (err) res.send(err);

        deckType.label = req.body.label;
        deckType.description = req.body.description;
        deckType.cards = req.body.cards;
        deckType.image_url = req.body.image_url;
        deckType.save(function(err) {
            if (err) res.send(err);

            else res.json(deckType);
        })
    });
});

// Delete card with id
router.delete('/delete/:deck_type_id', function(req, res) {
    DeckType.remove({
        _id: req.params.deck_type_id
    }, function(err, deckType) {
        if (err) res.send(err);

        else res.json({status: "OK"});
    })
});