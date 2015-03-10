// Database Wrapper for Mongo
// If Mongo is unavailable, this will mock it in-memory. THIS SHOULD BE USED FOR TESTING ONLY.

var mongoose = require('mongoose');

// Handle connection to MongoDB
function MongoDBConnection(bot) {
    var self = this;
    self.bot = bot;
    self.db = null;
    self.mocked = false;
    self.mongoose = mongoose; // expose mongoose to modules that may require it
    self.schemas = require('./schemas'); // expose schemas to modules that may require it

    // Cleanup db
    self.bot.events.on('shutdown', function () {
        if (self.db) {
            console.log('Closing database connection...');
            self.db.close();
        }
    });
}

MongoDBConnection.prototype = {

    // Perform connection to database.
    // if this is not a mock connection, attempt to start & connect to mock DB if this connection fails.
    connect : function (isMock) {
        var self = this;
        self.mocked = isMock || false;
        console.log('Connecting to database', self.bot.config.db_url);

        // Attempt this connection
        mongoose.connect(self.bot.config.db_url);
        self.db = mongoose.connection;

        // Error connecting
        self.db.on('error', function (err) {
            if (isMock) {
                console.error('Error connecting to provided mock database:\n', err);
                throw err;
            } else {
                console.error('Error connecting to database:\n', err);
                self.db.close();
                delete self.db;
                if (self.bot.config.use_mock_db) {
                    console.log('Will provide mock database.\nThe mock DB will be empty, and not persist. It should be used for testing only.');
                    self.provideMockDb();
                } else {
                    throw err;
                }
            }
        });

        // Successful connection
        self.db.once('open', function () {
            if (isMock || !self.mocked) {
                if (isMock) {
                    console.log('Connected to mock DB.');
                } else {
                    console.log('Connected to MongoDB.');
                }
                self.bot.events.emit('db_connected', self);
            }
        });
    },

    // Spawn temporary mock DB with mongodb-fs.
    provideMockDb : function () {
        var mongodbfs = require('mongodb-fs'),
            self = this;

        // Initialize the fake
        mongodbfs.init({
          port : 27017,
          fork : true
        });

        // Start the fake running.
        mongodbfs.start(function (err) {
            if (err) {
                console.error('Error providing mock database:\n', err);
                throw err;
            }

            // Make sure we shut down, or the fake DB will continue running after process exit.
            self.bot.events.on('shutdown', function () {
                if (self.db) {
                    console.log('Shutting down mock DB...');
                    mongodbfs.stop();
                }
            });

            // Set the URL to the fake before connecting
            self.bot.config.db_url = 'mongodb://localhost:27017/fritbot';
            self.connect(true);
        });
    }
};

module.exports = MongoDBConnection;