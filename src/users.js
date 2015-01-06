var User = require('./schemas/user');

function UserManager (bot) {
	this.bot = bot;
	this.users = {};

	var self = this;

	// Load known users into memory
	User.find({}).exec(function (err, userList) {
		var user;
		for (var i in userList) {
			user = userList[i];
			self.users[user.uid] = user;
		}
		console.log('Users loaded.');
	});
}

UserManager.prototype = {
	getUser : function (uid) {
		if (uid in this.users) {
			return this.users[uid];
		} else {
			console.log('Creating user:', uid);
			var user = new User({ uid : uid });
			user.save();
			this.users[uid] = user;
			return user;
		}
	}
};

module.exports = UserManager;