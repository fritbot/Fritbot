var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
    text : String,
    route : String,
    nickname : String,
    user_id : mongoose.Schema.Types.ObjectId,
    room : String,
    outbound : Boolean,
    date : { type : Date, default : Date.now }
});

var messageModel = mongoose.model('Message', messageSchema);

module.exports = messageModel;