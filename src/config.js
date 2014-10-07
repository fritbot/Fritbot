// Configuration Loader
// Merges input configuration with that from YAML files and ENV variables.

var yaml = require('js-yaml'),
	fs = require('fs'),
	_ = require('underscore');

function ConfigurationLoader() {
	// Internal defaults
	this.config = {
		name: 'Fritbot',
		responds_to: ['fritbot', 'fb', 'bot'],
		web: {
			port: 3000,
			bind_address: '0.0.0.0'
		},
		keepalive: {
		    host: 'localhost:3000',
		    interval: 600
		},
		node_directory: 'node_modules',
		module_directory: 'modules'
	};
}

ConfigurationLoader.prototype = {

	// Read configuration object
	loadConfig: function(newConfig) {
		if (newConfig) {
			this.config = _.extend(this.config, newConfig);
		}
	},

	// Load from config.yml
	loadYml: function () {
		if (!fs.existsSync('./config.yml')) {
			return;
		}

		console.log("Loading config.yml...");

		var newConfig = {}
		try {
		    newConfig = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'));
		} catch (e) {
		    console.log("Error parsing config.yml data!");
		    throw e;
		}
		this.config = _.extend(this.config, newConfig)
	},

	// Load a value from the env to a given position in the config.
	loadEnv: function (fromVar, toPath) {
		var path = toPath.split('.'),
			pos = this.config;

		// Walk the path, creating config object keys if neccesary.
		for (node in path.slice(0, -1)) {
			if (node in pos) {
				pos = pos[node];
			} else {
				pos[node] = {};
				pos = pos[node];
			}
		}
		pos[path.slice(-1)] = process.env[fromVar];
	}
};

module.exports = new ConfigurationLoader();