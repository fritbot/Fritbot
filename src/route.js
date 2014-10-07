// Route object
// Represents a valid route to send a message:
// Along a given connection to a user or to a room (and optionally to a specific user in a room)

var Q = require('q');

// All routes are on a given connector, but can be to a user, a room, or a room but directed at a specific user.
function Route(connector, room, user) {
	this.connector = connector;
	this.room = room;
	this.user = user;

	if (room && user) {
		this.uid = connector.idx + ":" + room + "/" + user
	} else if (room) {
		this.uid = connector.idx + ":" + room
	} else {
		this.uid = connector.idx + ":" + user
	}
}

// If this route was to a user in a room, remove the user and only send to the room.
// Noop if the route was to a user, or a room with no user direction.
Route.prototype.indirect = function() {
	if (this.user & this.room) {
		return new Route(this.connector, this.room);
	} else {
		return this;
	}
};

// If this route was to a user in a room, remove the room and directly to the user.
// Noop if the route was to a user, or a room with no user direction.
Route.prototype.direct = function() {
	if (this.user & this.room) {
		return new Route(this.connector, null, this.user);
	} else {
		return this;
	}
}

// Send a message along this route. Optionally delay the send of the message by the given number of seconds.
Route.prototype.send = function (message, delay) {
	var deferred = Q.defer(),
		msg = "Sending '" + message + "' to " + this.uid;
	if (!delay) {
		console.log(msg);
		this.connector.send(this, message, deferred);
	} else {
		console.log(msg, "(delayed", delay, "seconds)");
		setTimeout((function () {
			this.connector.send(this, message, deferred)
		}).bind(this), delay * 1000);
	}
	return deferred.promise;
};

module.exports = Route;
