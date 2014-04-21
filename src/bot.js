var events = require('events'),
	Web = require('./web'),
	ModuleLoader = require('./modules'),
	IntentService = require('./intent'),
	config = require('./config'),
	Q = require('q');

function Bot() {
	this.config = config;

	// Setup event bus
	this.events = new events.EventEmitter;

	// Setup the functional bits
	this.web = new Web(this);
	this.intent = new IntentService(this);
	this.modules = new ModuleLoader(this);

	// Turn on the connector
	this.connect();

	// Handle exits from wherever
	process.on('exit', (function () {
		this.shutdown();
	}).bind(this));
};

Bot.prototype.connect = function () {
	// Import the connector
	try {
		this.connector = new (require(this.config.connector.module))(this);
	} catch (e) {
		console.error("Error loading connector", this.config.connector.module);
		throw e;
	}
 }

Bot.prototype.send = function (route, message, delay) {
	// Wrap deferred & delay information so each connector does not need to define this.
	var deferred = Q.defer();

	if (!delay) {
		delay = 0
		console.log("Sending '" + message + "' to", route)
		this.events.emit('sendMessage', route, message, deferred);
	} else {
		console.log("Sending (delay", delay, "s) '", message, "' to ", route)
		setTimeout((function () {
			this.events.emit('sendMessage', route, message, deferred);
		}).bind(this), delay * 1000);
	}

	return deferred.promise;
}

Bot.prototype.shutdown = function () {
	// Make sure we only shut down once.
	if (this.shutting_down) { return; }
	this.shutting_down = true;

	console.log("\nGoodbye cruel world...");

	this.events.emit('shutdown');
}

module.exports = Bot;
