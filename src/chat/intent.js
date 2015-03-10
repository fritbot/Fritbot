// Intent Service
// Handles all inbound message triggers

function IntentService(bot) {
    this.bot = bot;
    this.commands = [];
    this.listeners = [];
    this.prompts = bot.config.responds_to.map(function (name) {
        return new RegExp('^\@?' + name + '\:? ');
    });

    // Listen to all inbound events
    this.bot.events.on('sawMessage', this.handleMessage.bind(this));
}

// Load an individual command. Bind it to the bot.
IntentService.prototype.loadCommand = function (spec) {
    this.commands.push({
        trigger : spec.trigger,
        func : spec.func.bind(this.bot)
    });
};

// Load an individual listener. Bind it to the bot.
IntentService.prototype.loadListener = function (spec) {
    this.listeners.push({
        trigger : spec.trigger,
        func : spec.func.bind(this.bot)
    });
};

// Splits arguments along spaces, unless arg is in quotes.
IntentService.prototype.splitArgs = function (message) {
    var args = message.match(/(?:[^\s"]+|"[^"]*")+/g);
    if (args) {
        return args;
    } else {
        if (message === '') {
            return [];
        } else {
            return [message];
        }
    }
};

// Handle a single inbound message along given route
IntentService.prototype.handleMessage = function (route, message) {
    var matches = [],
        isCommand = (route.room === null), // All direct messages are interpreted as commands
        i, matched;

    // Commands in rooms are prefixed with the bot name (or alias)
    // If so, remove the name to get just the command.
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
            matched = this.commands[i].trigger.exec(message);
            if (matched && matched.index === 0) {
                matched.func = this.commands[i].func;
                matches.push(matched);
            }
        }

        if (matches.length) {
            matched = [''];

            // Pick the match that matched the longest substring
            // Semi-intelligently handles cases where multiple commands match
            for (i = 0; i < matches.length; i++) {
                if (matches[i][0].length > matched[0].length) {
                    matched = matches[i];
                }
            }

            // Call the command and pass in arguments.
            matched.func(route, this.splitArgs(message.slice(matched[0].length)));

            // Do not execute any listeners if a command matched.
            return;
        }
    }

    // Check for listener matches
    matches = [];
    for (i = 0; i < this.listeners.length; i++) {
        matched = this.listeners[i].trigger.exec(message);

        if (matched) {
            matched.func = this.listeners[i].func;
            matches.push(matched);
        }
    }

    // Listeners are executed in order of match length
    // Execution stops only if a listener returns true, otherwise the next longest listener is executed.
    // This can result in multiple responses. In practice a listener should always return true if it makes a response.
    if (matches.length) {
        matches.sort(function (a, b) {
            return a[0].length > b[0].length;
        });

        for (i = 0; i < matches.length; i++) {
            if (matches[i].func(route, message)) {
                return;
            }
        }
    }

    // If this was a command (prefixed by the bot name/alias) but we couldn't understand anything from it, express our confusion.
    if (isCommand) {
        route.send('Huh?');
    }
};

module.exports = IntentService;
