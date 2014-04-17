var readline = require('readline');

function ShellConnector(bot) {
	var self = this;
	self.bot = bot;
    self.config = bot.config.connector;

    stdin = process.openStdin()
    stdout = process.stdout

    self.repl = readline.createInterface(stdin, stdout, null)

    self.repl.on('close', function() {
		self.bot.shutdown();
	});

	self.repl.on('line', function(buffer) {
		self.repl.prompt();
		self.bot.sawMessage({user: null, room: null}, buffer);
	})

	self.repl.setPrompt(self.bot.config.name + ">");
	self.repl.prompt();

}

ShellConnector.prototype.send = function (route, message, deferred) {
	console.log("-->", message);
	deferred.resolve();
	this.repl.prompt();
}

ShellConnector.prototype.shutdown = function () {
	stdin.destroy();	
}

module.exports = ShellConnector
