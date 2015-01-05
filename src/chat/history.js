// History Service
// Logs all inbound messages to the db & console.

var Message = require('../schemas/message');

function HistoryService(bot) {
	this.bot = bot;

	// Record all inbound chat information.
	this.bot.events.on('sawMessage', this.handleMessage.bind(this));
}

// Yay a message!
HistoryService.prototype.handleMessage = function (route, message) {
	console.log('Recieved Message:', route.uid, message);

	Message.create({
		text : message,
		route : route.uid,
		nickname : route.user,
		room : route.room
	});
};

module.exports = HistoryService;
