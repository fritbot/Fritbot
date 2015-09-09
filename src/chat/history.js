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

        var doc = {
            text : message,
            route : route.uid,
            room : route.room,
            outbound : isSelf
        };

        if (route.user) {
            doc.user_id = route.user.id;
            doc.nickname = route.user.nick;
            route.user.wasSeen();
        }

        Message.create(doc);
    },

    handleSentMessage : function (route, message) {
        this.handleMessage(route, message, true);
    }
};

module.exports = HistoryService;
