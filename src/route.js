var Q = require('q');

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

Route.prototype.indirect = function() {
	if (this.user & this.room) {
		return new Route(this.connector, this.room);
	} else {
		return this;
	}
};

Route.prototype.direct = function() {
	if (this.user & this.room) {
		return new Route(this.connector, null, this.user);
	} else {
		return this;
	}
}

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
