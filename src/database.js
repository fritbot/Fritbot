// Database Wrapper for Mongo

var mongoose = require('mongoose-q')();

// Handle connection to MongoDB
function MongoDBConnection(bot) {
    var self = this;
    self.bot = bot;
    self.db = null;
    self.mongoose = mongoose; // expose mongoose to modules that may require it
    self.schemas = require('./schemas'); // expose schemas to modules that may require it

    bot.configLoader.ensure('db_debug', false, 'Emit debug information about the database to logs');
    bot.configLoader.ensure('db_url', 'mongodb://localhost:27017/fritbot', 'Mongo Database URL');


    if (bot.config.db_debug) {
        mongoose.set('debug', true);
    }

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
    connect : function () {
        var self = this;
        console.log('Connecting to database', self.bot.config.db_url);

        // Attempt this connection
        mongoose.connect(self.bot.config.db_url);
        self.db = mongoose.connection;

        // Error connecting
        self.db.on('error', function (err) {
            console.error('Error connecting to database:\n', err);
            throw err;
        });

        // Successful connection
        self.db.once('open', function () {
            console.log('Connected to MongoDB.');
            self.bot.events.emit('db_connected', self);
        });
    }
};

module.exports = MongoDBConnection;