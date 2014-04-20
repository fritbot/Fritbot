function IntentService(bot) {
	this.bot = bot;
	this.commands = [];
	this.listeners = [];

	this.bot.events.on('sawMessage', this.handleMessage.bind(this));
}

IntentService.prototype.loadCommand = function (spec) {
	this.commands.push({
		'trigger': spec.trigger,
		'func': spec.func.bind(this)
	});
}

IntentService.prototype.loadListener = function (spec) {
	this.listeners.push({
		'trigger': spec.trigger,
		'func': spec.func.bind(this)
	});
}

IntentService.prototype.handleMessage = function (route, message) {
	var matches = [],
		i, matched;

	// Find all matches
	for(i = 0; i < this.commands.length; i++) {
		matched = this.commands[i].trigger.exec(message)
		if (matched) {
			matched.func = this.commands[i].func
			matches.push(matched);
		}
	}

	if (matches.length) {
		matched = ['']

		// Pick the match that matched the longest substring
		for (i = 0; i < matches.length; i++) {
			if (matches[i][0].length > matched[0].length) {
				matched = matches[i]
			}
		}

		console.log(matched)
		matched.func(route, message.slice(matched[0].length))
	}
}

module.exports = IntentService;
