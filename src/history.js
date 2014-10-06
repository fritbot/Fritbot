function HistoryService(bot) {
	this.bot = bot;

	this.bot.events.on('sawMessage', this.handleMessage.bind(this));
}

HistoryService.prototype.handleMessage = function (route, message) {
	console.log("Recieved Message:", route.uid, message);
}

module.exports = HistoryService;
