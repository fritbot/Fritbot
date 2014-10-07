var express = require("express");

module.exports = function (app) {

	// Set up views!
	app.set("views", __dirname + "/templates");
	app.set("view engine", "jade");

	// Set up static resources directory
	app.use(express.static(__dirname + "/static/"));

	// In case of 404, respond in the most appropriate way possible.
	app.use(function(req, res, next){
		if (req.accepts('html')) {
			res.status(404);
			res.render('404', { url: req.url });
			return;
		}
		if (req.accepts('json')) {
			res.send({ error: 'Not found' });
			return;
		}
		res.type('txt').send('Not found');
	});

	app.use(require('errorhandler')())
};