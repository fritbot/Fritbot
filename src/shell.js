// Fritbot shell pseudo-connector
// Used for local testing, is active when no connectors are defined.

var readline = require('readline'),
	devnull = require('dev-null');

function ShellConnector(bot, index, Route) {
	var self = this;
	self.bot = bot;
    self.config = bot.config.connector;
    self.Route = Route
    self.idx = 'shell-' + index

    this.stdin = process.openStdin()
    // If we're already in the node REPL, we need to output to a null stream to prevent double-characters.
    if (process.argv.length == 1) {
    	// Also output a helpful message.
    	console.log('Running in repl mode.\nWelcome to the wonderful world of Fritbot!\n');
    	this.stdout = devnull();
    } else {
    	this.stdout = process.stdout
    }

    // Read-evaluate-print loop
    self.repl = readline.createInterface(this.stdin, this.stdout, null)

    // Shutdown when the prompt dies for any reason
    self.repl.on('close', function() {
		self.bot.shutdown();
	});

    // When we get a line, call this funciton
	self.repl.on('line', function(buffer) {
		// Very simple room emulation
		var match = buffer.match(/([a-z]+)\> ?/i);

		if(match) {
			// Call this from a room
			self.bot.events.emit('sawMessage', new self.Route(self, match[1], "console"), buffer.slice(match[0].length));
		} else {
			// Call this from a private chat
			self.bot.events.emit('sawMessage', new self.Route(self, null, "console"), buffer);
		}

		// Display the prompt again.
		self.repl.prompt();
	})

	// Handle events
	self.bot.events.on('shutdown', self.shutdown.bind(this));
	self.bot.events.on('sendMessage', self.send.bind(this));

	// User prompt
	self.repl.setPrompt(self.bot.config.name + "> ");
	self.repl.prompt();

	// Let the bot know we're good to go.
	self.bot.events.emit('connected');

}

// Sending a message consists of printing it to the shell
ShellConnector.prototype.send = function (route, message, deferred) {
	if (route.user) { message = "@" + route.user + ": " + message; }
	if (route.room) { message = route.room + ": " + message; }
	console.log(message);
	this.repl.prompt();
	deferred.resolve();
}

// Shut down repl
ShellConnector.prototype.shutdown = function () {
	this.repl.close();
	this.stdin.destroy();
	// Allow anything that may be in progress to finish.
	setTimeout(process.exit, 500);
}

// Simply display that we would have entered a room
ShellConnector.prototype.joinRoom = function (room) {
	console.log('Joining Room', room);
	this.bot.events.emit('joinedRoom', room);
}

// Simply display that we would have left a room
ShellConnector.prototype.leaveRoom = function (room) {
	console.log('Leaving Room', room);
	this.bot.events.emit('leftRoom', room);
}

module.exports = ShellConnector
