// Test code!
// Override node and module directories as they are above this directory.

var bot_party = require('../index.js'),
	bot = new bot_party.bot({
		module_directory: '../../fb-modules',
		node_directory: '../node_modules'
	})