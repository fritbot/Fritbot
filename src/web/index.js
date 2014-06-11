
var express = require('express'),
	router = require('./router'),
	settings = require('./settings');

function Web(bot) {
	this.bot = bot;
	this.app = express();
	router(this.app);	
	settings(this.app);
	this.server = this.app.listen(this.bot.config.web.port, process.env.BIND_ADDRESS || '0.0.0.0');
	console.log("Web listening on", process.env.BIND_ADDRESS || '0.0.0.0' + ":" + this.bot.config.web.port);

	this.bot.events.on('shutdown', this.shutdown.bind(this));
}

Web.prototype.shutdown = function () {
	this.server.close();
}

module.exports = Web;
