var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	uid : String
});

var userModel = mongoose.model('user', userSchema);

module.exports = userModel;