// Database Wrapper for Mongo
// If Mongo is unavailable, this will mock it in-memory. THIS SHOULD BE USED FOR TESTING ONLY.
// In theory this can be replaced with alternate DBs in the future, but we'll see about that later.

var MongoClient = require('mongodb').MongoClient;

// Handle connection to MongoDB
function MongoDBConnection(bot) {
	var self = this;
	self.bot = bot;
	self.db = null;

	// Cleanup db
	self.bot.events.on('shutdown', function() {
		if (self.db) {
			console.log("Closing database connection...");
			self.db.close();
		}
	});
}

MongoDBConnection.prototype = {

	// Perform connection to database.
	// if this is not a mock connection, attempt to start & connect to mock DB if this connection fails.
	connect: function(isMock) {
		var self = this;
		console.log("Connecting to database", self.bot.config.db_url)

		// Attempt this connection
		MongoClient.connect(self.bot.config.db_url, function(err, db) {
			if (err) {
				// Handle errors as appropriate.
				// Errors in initial connection will spawn a mock DB.
				if (isMock) {
					console.log("Error connecting to provided mock database:\n", err);
					throw err
				} else {
					console.log("Error connecting to database:\n", err)
					if (self.bot.config.use_mock_db) {
						console.log("Will provide mock database.\nThe mock DB will be empty, and not persist. It should be used for testing only.");
						self.provideMockDb();
					} else {
						throw err;
					}
				}
			} else {
				// Successfully connected!
				self.db = db;
				if (isMock) {
					console.log("Connected to mock DB.");
				} else {
					console.log("Connected to MongoDB.");
				}
				self.bot.events.emit('db_connected', self);
			}
		});
	},

	// Spawn temporary mock DB with mongodb-fs.
	provideMockDb: function() {
		var mongodbfs = require('mongodb-fs'),
			self = this;

		// Initialize the fake
		mongodbfs.init({
		  port: 27017,
		  fork: true,
		});

		// Start the fake running.
		mongodbfs.start(function (err) {
			if (err) {
				console.log("Error providing mock database:\n", err);
				throw err;
			}

			// Make sure we shut down, or the fake DB will continue running after process exit.
			self.bot.events.on('shutdown', function() {
				if (self.db) {
					console.log("Shutting down mock DB...");
					mongodbfs.stop();
				}
			});

			// Set the URL to the fake before connecting
			self.bot.config.db_url = 'mongodb://localhost:27017/fritbot';
			self.connect(true);
		});
	}
}

module.exports = MongoDBConnection