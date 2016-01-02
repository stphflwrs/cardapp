var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    Card = mongoose.model('Card');

module.exports = function (app) {
    app.use('/api/cards', router);
};

// Retrieve all cards
router.get('/', function(req, res) {
    Card.find(function(err, cards) {
        if (err) res.send(err);

        else res.json(cards);
    });
});

// Create new card
router.post('/create', function(req, res) {
    var card = new Card(req.body);

    card.save(function(err) {
        if (err) res.send(err);

        else res.json(card);
    });
});

// Retrieve card with id
router.get('/retrieve/:card_id', function(req, res) {
    Card.findById(req.params.card_id, function(err, card) {
        if (err) res.send(err);

        else res.json(card);
    });
});

// Update card with id
router.put('/update/:card_id', function(req, res) {
    Card.findById(req.params.card_id, function(err, card) {
        if (err) res.send(err);

        card.label = req.body.label;
        card.description = req.body.description;
        card.value = req.body.value;
        card.image_url = req.body.image_url;
        card.save(function(err) {
            if (err) res.send(err);

            else res.json(card);
        })
    });
});

// Delete card with id
router.delete('/delete/:card_id', function(req, res) {
    Card.remove({
        _id: req.params.card_id
    }, function(err, card) {
        if (err) res.send(err);

        else res.json({status: "OK"});
    })
});