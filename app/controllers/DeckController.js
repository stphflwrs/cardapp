var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	Deck = mongoose.model('Deck');

module.exports = function (app) {
	app.use('/api/decks', router);
};

// Get all decks ever
var getDecks = function (req, res) {
	Deck.find(function (err, decks) {
		if (err) res.send(err);

		else res.json(decks);
	});
};

// Create a deck based on a DeckType (given by ID) [REQUIRED]
var postDeck = function (req, res) {
	if (!req.body.deck_type_id) {
		return res.status(422).json({ message: "deck_type_id is required" });
	}

	var DeckType = mongoose.model('DeckType');
	var deck = new Deck();
	deck.cards = [];
	DeckType.findById(req.body.deck_type_id).populate('cards.card').exec(function (err, deckType) {
		if (!deckType) {
			return res.status(422).json({ message: "Deck not found" });
		}

		for (var i = 0; i < deckType.cards.length; i++) {
			for (var j = 0; j < deckType.cards[i].amount; j++) {
				deck.cards = deck.cards.concat(deckType.cards[i].card);
			}
		}

		deck.save(function (err) {
			if (err)
				return res.send(err);

			else
				return res.json(deck);
		});
	});
};

// Retrieve a single deck based on ID
var getDeck = function (req, res) {
	Deck.findById(req.params.deck_id).populate('cards').exec(function (err, deck) {
		if (err)
			return res.send(err);

		else
			return res.json(deck);
	});
};

// Delete a deck
var deleteDeck = function (req, res) {
	Deck.remove({
		_id: req.params.deck_id
	}, function (err, deck) {
		if (err)
			return res.send(err);

		else
			return res.json({status: "OK"});
	});
};

var shuffleDeck = function (req, res) {
	Deck.findById(req.params.deck_id).populate('cards').exec(function (err, deck) {
		if (err)
			return res.send(err);

		if (!deck)
			return res.status(404).json({status: "Deck not found."});

		for (var i = 0; i < deck.cards.length; i++) {
			var j = Math.floor(Math.random() * (i + 1));
			console.log(j + " ");
			var temp = deck.cards[i];
	        deck.cards[i] = deck.cards[j];
	        deck.cards[j] = temp;
		}

		deck.save(function (err) {
			if (err)
				return res.status(500).send(err);
			else
				return res.json(deck);
		});
	});
};

// Routes
router.get('/', getDecks);
// router.post('/create', postDeck);
router.get('/retrieve/:deck_id', getDeck);
router.delete('/delete/:deck_id', deleteDeck);

router.get('/shuffle/:deck_id', shuffleDeck);