var events = require('events'),
	request = require('request'),
	Web = require('./web'),
	ModuleLoader = require('./modules'),
	IntentService = require('./intent'),
	HistoryService = require('./history'),
	config = require('./config'),
	Route = require('./route'),
	Q = require('q');

function Bot() {
	this.config = config;

	// Setup event bus
	this.events = new events.EventEmitter;

	// Setup the functional sub-bits
	this.web = new Web(this);
	this.history = new HistoryService(this);
	this.intent = new IntentService(this);
	this.modules = new ModuleLoader(this);

	// start keepalive, if configured
	if (this.config.keepalive) {
		var url = "http://" + this.config.keepalive.host + "/health"
		console.log("Keeping alove every", this.config.keepalive.interval, "seconds at", url);
		setInterval(function () {
				request.get(url, function(){});
			}, this.config.keepalive.interval * 1000);
	}

	// Turn on the connectors
	this.connectors = {};

	for (var i = 0; i < this.config.connectors.length; i++) {
		var connector, module = this.config.connectors[i].module;
		try {
			// Create the connector, pass it some stuff it should know.
			connector = new (require(module))(this, i, Route);
		} catch (e) {
			console.error("Error loading connector", module + '-' + i);
			throw e;
		}
		this.connectors[connector.idx] = connector;
	}

	// Handle exits from wherever
	process.on('exit', (function () {
		this.shutdown();
	}).bind(this));
};

Bot.prototype.shutdown = function () {
	// Make sure we only shut down once.
	if (this.shutting_down) { return; }
	this.shutting_down = true;

	console.log("\nGoodbye cruel world...");

	this.events.emit('shutdown');
}

module.exports = Bot;
