function IntentService(bot) {
	this.bot = bot;
	this.commands = [];
	this.listeners = [];
	this.prompts = bot.config.responds_to.map(function (name) {
		return new RegExp("^\@?" + name + "\:? ");
	})

	this.bot.events.on('sawMessage', this.handleMessage.bind(this));
}

IntentService.prototype.loadCommand = function (spec) {
	this.commands.push({
		'trigger': spec.trigger,
		'func': spec.func.bind(this.bot)
	});
}

IntentService.prototype.loadListener = function (spec) {
	this.listeners.push({
		'trigger': spec.trigger,
		'func': spec.func.bind(this.bot)
	});
}

IntentService.prototype.splitArgs = function (message) {
	var args = message.match(/(?:[^\s"]+|"[^"]*")+/g);
	if (args) {
		return args
	} else {
		return message
	}
}

IntentService.prototype.handleMessage = function (route, message) {
	var matches = [],
		isCommand = (route.room == null), // All direct messages are interpreted as commands
		i, matched;

	// Is this a command? If so, remove the prompt.
	for (i = 0; i < this.prompts.length; i++) {
		matched = message.match(this.prompts[i]);
		if (matched) {
			isCommand = true;
			message = message.slice(matched[0].length);
			break;
		}
	}

	if (isCommand) {
		// Find all matches
		for (i = 0; i < this.commands.length; i++) {
			matched = this.commands[i].trigger.exec(message)
			if (matched && matched.index == 0) {
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

			matched.func(route, this.splitArgs(message.slice(matched[0].length)))
			return;
		}
	}

	// Check for listener matches
	matches = [];
	for (i = 0; i < this.listeners.length; i++) {
		matched = this.listeners[i].trigger.exec(message)

		if (matched) {
			matched.func = this.listeners[i].func
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

		matched.func(route, message)
		return;
	}

	if (isCommand) {
		this.bot.send(route, "Huh?");
	}
}

module.exports = IntentService;
