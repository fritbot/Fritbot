var Web = require('./web'),
	config = require('./config'),
	Q = require('q');

function Bot() {
	this.config = config;

	this.web = new Web(this);
	this.web.init();
	this.connect();

	process.on('exit', (function () {
		this.shutdown();
	}).bind(this));
};

Bot.prototype.connect = function () {
	if (this.config.connector.module === 'shell') {
		this.connector = new (require('./shell'))(this);
	} else {
		this.connector = new (require(this.config.connector.module))(this);
	}
}

Bot.prototype.send = function (route, message, delay) {
	var deferred = Q.defer();

	if (!delay) {
		delay = 0
		console.log("Sending '" + message + "' to", route)
		return this.connector.send(route, message, deferred);
	} else {
		console.log("Sending (delay", delay, "s) '", message, "' to ", route)
		setTimeout((function () {
			return this.connector.send(route, message, deferred);
		}).bind(this), delay * 1000);
	}

	return deferred.promise;
}

Bot.prototype.sawMessage = function (route, message) {
	console.log("Got '" + message + "' from", route);

	this.send(route, message);
}

Bot.prototype.shutdown = function () {
	if (this.connector) {
		this.connector.shutdown();
	}

	this.web.shutdown();
	process.exit(0);
}

module.exports = Bot;
