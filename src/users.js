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
	getOrCreateUser : function (uid, nick) {
		if (uid in this.users) {
			return this.users[uid];
		} else {
			console.log('Creating user:', uid);
			var user = new User({ uid : uid, nick : nick });
			user.save();
			this.users[uid] = user;
			return user;
		}
	},

	getUserMatch : function (match) {
		var rex, i, user, found = null, pct = 0, result, match_pct;

		// Base case, match is just a uid
		if (match in this.users) {
			return this.users[match];
		}

		// Search through for regex matches
		rex = new RegExp(match, 'i');
		for (i in this.users) {
			user = this.users[i];
			result = rex.exec(user.uid);
			if (result !== null) {
				match_pct = result[0].length / user.uid.length;
				if (match_pct > pct) {
					found = user;
					pct = match_pct;
				}
			}
		}

		return found;
	}
};

module.exports = UserManager;