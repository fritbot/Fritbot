var events = require('events'),
    path = require('path'),
    I18nService = require('./i18n'),
    ModuleLoader = require('./modules'),
    IntentService = require('./chat/intent'),
    HistoryService = require('./chat/history'),
    configLoader = require('./config'),
    Route = require('./chat/route'),
    DatabaseConnection = require('./database'),
    UserManager = require('./users'),
    Q = require('q'); //jshint ignore:line

function Bot(config) {
    // Determine version
    this.version = require('../package.json').version;

    // Load yaml files
    configLoader.loadYml();

    // Load dynamic configuration
    configLoader.loadConfig(config);


    // Defaults
    configLoader.ensure('name', 'Fritbot', 'Name of the bot');
    configLoader.ensure('responds_to', ['fritbot', 'fb', 'bot'], 'Responds to commands directed at these');
    configLoader.ensure('locale', 'en', 'Default locale language to use');
    configLoader.ensure('node_directory', 'node_modules', null, true);
    configLoader.ensure('module_directory', 'modules', null, true);

    // Setup event bus
    this.events = new events.EventEmitter();

    // Store references for modules to use
    this.config = configLoader.config;
    this.configLoader = configLoader;

    // Load lang files
    this.i18n = new I18nService(this);
    this.i18n.loadLangFiles(path.join(__dirname, '..', 'lang'));

    // DB init must be before other bits
    this.db = new DatabaseConnection(this);
    this.db.connect();

    // Setup the functional sub-bits
    this.history = new HistoryService(this);
    this.intent = new IntentService(this);
    this.users = new UserManager(this);
    this.modules = new ModuleLoader(this);

    this.events.on('db_connected', this.initConnectors.bind(this));

    // Handle exits from wherever
    process.on('exit', (function () {
        this.shutdown();
    }).bind(this));
}

Bot.prototype = {
    // Signal shutdown to various modules (db, connectors, etc)
    shutdown : function () {
        // Make sure we only shut down once.
        if (this.shutting_down) { return; }
        this.shutting_down = true;

        console.log('\nGoodbye cruel world...');

        this.events.emit('shutdown');
    },

    // Turn on the connectors (after the DB loads)
    initConnectors : function () {
        var connector;
        this.connectors = {};

        if (this.config.connector) {
            var module = this.config.connector,
                modulePath = path.join(process.cwd(), this.config.node_directory, module);
            try {
                // Create the connector, pass it some stuff it should know.
                connector = new (require(modulePath))(this, Route);
            } catch (e) {
                console.error('Error loading connector', module);
                throw e;
            }
            this.connector = connector;
        } else {
            // No connector specified - load the shell
            connector = new (require('./chat/shell'))(this, Route);
            this.connector = connector;
        }
    }
};

module.exports = Bot;
