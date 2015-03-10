var events = require('events'),
    ModuleLoader = require('./modules'),
    IntentService = require('./chat/intent'),
    HistoryService = require('./chat/history'),
    configLoader = require('./config'),
    Route = require('./chat/route'),
    DatabaseConnection = require('./database'),
    UserManager = require('./users'),
    Q = require('q'); //jshint ignore:line

function ScriptBot(config) {
    // Load hardcoded configuration
    configLoader.loadConfig(config);

    // Load yaml files
    configLoader.loadYml();

    // Store references for modules to use
    this.config = configLoader.config;
    this.configLoader = configLoader;

    // Setup event bus
    this.events = new events.EventEmitter();

    // DB init must be before other bits
    this.db = new DatabaseConnection(this);
    this.db.connect();

    // Setup the functional sub-bits
    this.history = new HistoryService(this);
    this.intent = new IntentService(this);
    this.users = new UserManager(this);
    this.modules = new ModuleLoader(this);

    // Handle exits from wherever
    process.on('exit', (function () {
        this.shutdown();
    }).bind(this));
}

ScriptBot.prototype = {
    // Signal shutdown to various modules (db, connectors, etc)
    shutdown : function () {
        // Make sure we only shut down once.
        if (this.shutting_down) { return; }
        this.shutting_down = true;

        console.log('\nFritbot script exit');

        this.events.emit('shutdown');
    },

    // Turn on the shell connector, if requested by loading script.
    showShell : function () {
        var connector;
        this.connectors = {};
        connector = new (require('./chat/shell'))(this, 0, Route);
        this.connectors[connector.idx] = connector;
    }
};

module.exports = ScriptBot;
