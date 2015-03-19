var mongoose = require('mongoose-q')();

var userSchema = new mongoose.Schema({
    uid : String,
    nick : String
});

var userModel = mongoose.model('user', userSchema);

module.exports = userModel;