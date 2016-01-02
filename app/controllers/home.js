var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    Article = mongoose.model('Article');

router.get('/', function (req, res, next) {
    Article.find(function (err, articles) {
        if (err) return next(err);
        res.sendFile(__dirname + "/public/index.html");
    });
});

module.exports = function (app) {
    app.use('/api', router);
};

router.route('/articles')
    .get(function(request, response) {
        response.send("Hello GET");
    });