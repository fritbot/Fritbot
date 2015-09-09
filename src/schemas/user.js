var mongoose = require('mongoose-q')();

var userSchema = new mongoose.Schema({
    uid : String,
    nick : String,
    admin : { type : Boolean, default : false },
    seen : Date
});

userSchema.methods.wasSeen = function () {
	this.seen = Date.now();
	this.save();
};

var userModel = mongoose.model('user', userSchema);

module.exports = userModel;