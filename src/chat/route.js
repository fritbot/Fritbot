// Route object
// Represents a valid route to send a message:
// Along a given connection to a user or to a room (and optionally to a specific user in a room)

var Q = require('q');

// All routes are on a given connector, but can be to a user, a room, or a room but directed at a specific user.
function Route(connector, room, username, nick) {
    this.connector = connector;
    this.room = room;

    this.uid = connector.idx;

    if (room) { this.uid += '/' + room; }
    if (username) {
        this.username = username;
        this.nick = nick || username;
        this.uid += ':' + username;
        this.user_uid = connector.idx + ':' + username;
        // Get or create user record
        this.user = username && connector.bot.users.getOrCreateUser(this.user_uid, this.nick);
    }
}

// If this route was to a user in a room, remove the user and only send to the room.
// Noop if the route was to a user, or a room with no user direction.
Route.prototype.indirect = function () {
    if (this.user && this.room) {
        return new Route(this.connector, this.room);
    } else {
        return this;
    }
};

// If this route was to a user in a room, remove the room and directly to the user.
// Noop if the route was to a user, or a room with no user direction.
Route.prototype.direct = function () {
    if (this.user && this.room) {
        return new Route(this.connector, null, this.username, this.nick);
    } else {
        return this;
    }
};

// Send a message along this route. Optionally delay the send of the message by the given number of seconds.
Route.prototype.send = function (message, delay) {
    var deferred = Q.defer(),
        msg = 'Sending "' + message + '" to ' + this.uid;
    if (!delay) {
        console.log(msg);
        this.connector.send(this, message, deferred);
    } else {
        console.log(msg, '(delayed', delay, 'seconds)');
        setTimeout((function () {
            this.connector.send(this, message, deferred);
        }).bind(this), delay * 1000);
    }
    return deferred.promise;
};

module.exports = Route;
