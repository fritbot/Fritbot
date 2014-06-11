var yaml = require('js-yaml'),
	fs = require('fs'),
	config;

// Load the config YAML
try {
    config = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'));
} catch (e) {
    console.log("------------------\nError parsing config.yml data.\n------------------\n");
    throw e;
}

// Detect if we are in Heroku, we need to use a different port
if (process.env.PORT) {
	config.web.port = process.env.PORT;
}

if (config.keepalive && process.env.KEEPALIVE_HOST) {
	config.keepalive.host = process.env.KEEPALIVE_HOST;
}

module.exports = config;