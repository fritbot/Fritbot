var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
	text : String,
	route : String,
	nickname : String,
	user_id : String,
	room : String,
	date : { type : Date, default : Date.now }
});

var messageModel = mongoose.model('Message', messageSchema);

module.exports = messageModel;