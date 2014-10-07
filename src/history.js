// History Service
// TODO: This will eventually log all chat history to the database

function HistoryService(bot) {
	this.bot = bot;

	// Record all inbound chat information.
	this.bot.events.on('sawMessage', this.handleMessage.bind(this));
}

// For now, simply output to the console log.
HistoryService.prototype.handleMessage = function (route, message) {
	console.log("Recieved Message:", route.uid, message);
}

module.exports = HistoryService;
