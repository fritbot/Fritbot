// History Service
// Logs all inbound messages to the db & console.

var Message = require('../schemas/message');

function HistoryService(bot) {
	this.bot = bot;

	// Record all inbound chat information.
	this.bot.events.on('sawMessage', this.handleMessage.bind(this));
	this.bot.events.on('sentMessage', this.handleSentMessage.bind(this));
}

// Yay a message!
HistoryService.prototype = {
	handleMessage : function (route, message, isSelf) {
		isSelf = isSelf || false;
		if (!isSelf) {
			console.log('Received Message:', route.uid, message);
		}

		var user;

		if (route.user) {
			user = this.bot.users.getUser(route.user);
		}

		Message.create({
			text : message,
			route : route.uid,
			nickname : route.user,
			room : route.room,
			user_id : user,
			outbound : isSelf
		});
	},

	handleSentMessage : function (route, message) {
		this.handleMessage(route, message, true);
	}
};

module.exports = HistoryService;
