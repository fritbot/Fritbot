// Route object
// Represents a valid route to send a message:
// Along a given connection to a user or to a room (and optionally to a specific user in a room)

var Q = require('q'),
    _ = require('lodash');

// All routes are on a given connector, but can be to a user, a room, or a room but directed at a specific user.
function Route(connector, room, username, nick) {
    this.connector = connector;
    this.room = room;

    this.uid = '';

    if (room) { this.uid += room; }
    if (username) {
        this.username = username;
        this.nick = nick || username;
        this.uid += '/' + username;
        // Get or create user record
        this.user = connector.bot.users.getOrCreateUser(this.username, this.nick);
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

// Send a message along this route.
Route.prototype.send = function (message) {
    var deferred = Q.defer();

    if (message[0] === '?') {
        var args = _.drop(arguments),
            key = message.slice(1),
            locale = this.connector.bot.config.locale;

        message = this.connector.bot.i18n.doTemplate(locale, key, args);
    }

    console.log('Sending "' + message + '" to ' + this.uid);
    this.connector.send(this, message, deferred);
    return deferred.promise;
};

module.exports = Route;
