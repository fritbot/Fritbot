var User = require('./schemas/user');
var _ = require('lodash');

var room_roster = {};

function UserManager (bot) {
    this.bot = bot;
    this.bot.db.schemas.user = User;
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
    },

    userEntersRoom : function (route) {
        if (!room_roster[route.room]) {
            room_roster[route.room] = [route.user];
        } else if (!_.includes(room_roster[route.room])) {
            room_roster[route.room].push(route.user);
        }
    },

    userLeavesRoom : function (route) {
        if (room_roster[route.room]) {
            _.remove(room_roster[route.room], function (user) {
                return route.user.uid === user.uid;
            });
        }
    },

    getRoomRoster : function (room) {
        return room_roster[room];
    }
};

module.exports = UserManager;