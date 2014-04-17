
var express = require('express'),
	router = require('./router');

function Web(bot) {
	this.bot = bot;
	this.app = express();
	router(this.app);
}

Web.prototype.init = function () {
	this.app.listen(this.bot.config.web.port);
	console.log("Web listening on port", this.bot.config.web.port)
}

Web.prototype.shutdown = function () {}

module.exports = Web;
