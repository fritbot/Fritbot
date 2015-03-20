// Configuration Loader
// Merges input configuration with that from YAML files and ENV variables.

var yaml = require('js-yaml'),
    fs = require('fs'),
    _ = require('lodash');

function ConfigurationLoader() {
    this.config = {};
    this.descriptions = {};
}

ConfigurationLoader.prototype = {

    // Read configuration object
    loadConfig : function (newConfig) {
        if (newConfig) {
            this.config = _.merge(this.config, newConfig);
        }
    },

    // Load from config.yml
    loadYml : function () {
        if (!fs.existsSync('./config.yml')) {
            return;
        }

        console.log('Loading config.yml...');

        var newConfig = {};
        try {
            newConfig = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'));
        } catch (e) {
            console.log('Error parsing config.yml data!');
            throw e;
        }
        this.config = _.merge(this.config, newConfig);
    },

    // Ensure a config value exists, setting to default if not
    // If fallback is a list, number, or boolean, this will attempt to coerce any existing value to the same.
    // Specify false as the description to prevent it from displaying.
    // Optionally set description of value
    ensure : function (key, fallback, description) {
        if (typeof this.config[key] === 'undefined') {
            if (typeof fallback === 'undefined' || fallback === null) {
                throw new Error('Needed to ensure config key ' + key + ' but it was not set.');
            } else {
                this.config[key] = fallback;
            }
        }

        // Coerce to appropriate type
        if (typeof this.config[key] === 'string') {
            if (_.isArray(fallback)) {
                this.config[key] = _.trimLeft(_.trimRight(this.config[key], ']'), '[').split(/[, ]+/);
            } else if (typeof fallback === 'number') {
                this.config[key] = +this.config[key];
            } else if (typeof fallback === 'boolean') {
                this.config[key] = this.config[key] === 'true';
            }
        }

        // Log description of config value
        if (typeof description !== 'undefined') {
            this.descriptions[key] = description;
        }
    }
};

module.exports = new ConfigurationLoader();