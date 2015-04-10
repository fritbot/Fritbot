var fs = require('fs'),
    path = require('path');

function ModuleLoader(bot) {
    this.bot = bot;
    this.loaded = [];

    var npm_modules = [], local_modules = [],
        name, module, modules = [], package_json;

    console.log('Reading module directories...');

    // Load modules in the ./node_modules directory
    try {
        npm_modules = fs.readdirSync(bot.config.node_directory).map(function (x) {
            return path.join(process.cwd(), bot.config.node_directory, x); // Need to map on full path to modules.
        });
    } catch (e) {
        console.log('Error reading node_modules dir', bot.config.node_directory, '\n', e, '\nWon\'t be loading modules from there.');
    }

    // Load modules in the ./modules directory
    try {
        local_modules = fs.readdirSync(bot.config.module_directory).map(function (x) {
            return path.join(process.cwd(), bot.config.module_directory, x); // Need to map on full path to modules.
        });
    } catch (e) {
        console.log('No local modules dir', bot.config.module_directory, ', this is fine (unless you thought you created it...)');
    }

    // Concatenate full list of modules to load.
    modules = npm_modules.concat(local_modules);

    console.log('Beginning module load...');

    for (var i = 0; i < modules.length; i++) {
        name = modules[i];

        // Skip if it's a hidden folder
        if (path.basename(name)[0] === '.') {
            continue;
        }

        // Load the package metadata. Exclude modules that do not have a package.
        try {
            package_json = require(path.join(name, 'package.json'));
        } catch (e) {
            package_json = {
                name : path.basename(name),
                keywords : ['fritbot-module']
            };
            if (name.indexOf(bot.config.node_directory) !== -1) {
                console.log('Error loading package.json for', name, ', skipping this module.\n', e);
                continue;
            }
        }

        if (typeof package_json.keywords === 'undefined') {
            console.log('Module', package_json.name, 'not loaded: it does not have the fritbot-module keyword.');
            continue;
        }

        // Exclude packages with incorrect metadata so we aren't loading random things.
        if (package_json.keywords.indexOf('fritbot-module') === -1) {

            // Display an error if it isn't a known module.
            if (package_json.keywords.indexOf('fritbot-connector') === -1 && package_json.name !== 'fritbot') {
                console.log('Module', package_json.name, 'not loaded: it does not have the fritbot-module keyword.');
            }
            continue;
        }

        // If the metadata looks good, attempt to require the module.
        try {
            module = require(name);
        } catch (e) {
            console.log('Error importing module:', name, '\n', e);
            throw e;
        }

        // Assuming require worked OK, now actually load the module into Fritbot.
        try {
            this.loadModule(module, package_json, null, name);
        } catch (e) {
            console.log('Error registering module:', name);
            throw e;
        }
    }

    console.log('Modules loaded successfully.');
    this.bot.events.emit('modulesLoaded');
}

ModuleLoader.prototype.loadModule = function (module, package_json, parent, pathname) {

    // Minimum required information for a module is the display name.
    if (!module.displayname) {
        console.log('Module', package_json.name, 'not loaded, requires a displayname parameter.');
        return;
    }

    console.log('Loading module', package_json.name + '/' + module.displayname);

    // Copy package metadata into the module for stuff like author, etc.
    // Only copy information that doesn't already exist on the module to prevent unexpected errors.
    for (var prop in package_json) {
        if (package_json.hasOwnProperty(prop) && !module.hasOwnProperty(prop)) {
            module[prop] = package_json[prop];
        }
    }

    // Set module parents for sub-modules
    if (parent) {
        module.parent = parent;
        module.name = package_json.name + '/' + module.displayname;
    }

    // If the module requires initialization, do so.
    if (module.init) {
        module.init(this.bot, this);
    }

    var i;
    // If the module has any commands, load them.
    if (module.commands) {
        for (i = 0; i < module.commands.length; i++) {
            module.commands[i].origin = module;
            this.bot.intent.loadCommand(module.commands[i]);
        }
    }

    // If the module has any listeners, load them.
    if (module.listeners) {
        for (i = 0; i < module.listeners.length; i++) {
            module.listeners[i].origin = module;
            this.bot.intent.loadListener(module.listeners[i]);
        }
    }

    // If the module has any children, load them.
    if (module.children) {
        for (i = 0; i < module.children.length; i++) {
            try {
                this.loadModule(module.children[i], package_json, module);
            } catch (e) {
                console.log('Error loading child module', module.children[i].displayname);
                throw (e);
            }
        }
    }

    // Add the module to the loaded set and emit event
    this.loaded.push(module);
    this.bot.events.emit('moduleLoaded', module, pathname);
};

module.exports = ModuleLoader;
