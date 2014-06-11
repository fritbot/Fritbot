var fs = require('fs'),
    path = require('path');

function ModuleLoader(bot) {
    this.bot = bot;
    this.loaded = [];

    var local_dir = this.bot.config.module_directory || 'modules',
        node_modules_dir = this.bot.config.node_directory || 'node_modules',
        npm_modules, local_modules,
        name, module, modules = [], package_json = undefined;

    try {
        npm_modules = fs.readdirSync(node_modules_dir);
    } catch (e) {
        console.log("Error reading node_modules dir,", node_modules_dir, "\n", e, "\nWon't be loading modules from there.")
    }

    try {
        local_modules = fs.readdirSync(local_dir);
    } catch (e) {
        console.log("Error reading modules dir", local_dir, "\n", e, "\nWon't be loading modules from there.")
    }


    modules = npm_modules.concat(local_modules.map(function (x) {
        return path.join(process.cwd(), local_dir, x);
    }))

    console.log("Beginning module load...");

    for(var i = 0; i < modules.length; i++){
        name = modules[i];
       
        try {
            module = require(name)
        } catch (e) {
            console.log("Error importing module:", name, "\n", e, "\n--- Continuing without it.");
            continue;
        }

        try {
            package_json = require(path.join(name, "package.json"));
        } catch (e) {
            package_json = {
                'name': name
            };
            console.log("Error loading package.json for", name, ", going to fake it till you make it.");
        }
        
        try {
            this.loadModule(module, package_json);  
        } catch (e) {
            console.log("Error registering module:", name);
            throw e;
        }
    }

    console.log("Modules loaded successfully.")
}

ModuleLoader.prototype.loadModule = function (module, package_json, parent) {

    if (!module.description || !module.displayname) {
        console.log(package_json.name, "doesn't look like a Fritbot module.");
        return;
    }

    console.log("Loading module", package_json.name + '/' + module.displayname);

    for(var prop in package_json) {
        if(package_json.hasOwnProperty(prop) && !module.hasOwnProperty(prop)) {
            module[prop] = package_json[prop]
        }
    }

    if (parent) {
        module.parent = parent;
    }

    if (module.init) {
        module.init(this.bot);
    }

    if (module.commands) {
        for (var i = 0; i < module.commands.length; i++) {
            module.commands[i].origin = module;
            this.bot.intent.loadCommand(module.commands[i]);
        }
    }

    if (module.listeners) {
        for (var i = 0; i < module.listeners.length; i++) {
            module.listeners[i].origin = module;
            this.bot.intent.loadListener(module.listeners[i]);
        }
    }

    if (module.children) {
        for (var i = 0; i < module.children.length; i++) {
            try {
                this.loadModule(module.children[i], package_json, module);
            } catch (e) {
                console.log("Error loading child module", i);
                throw(e);
            }
        }
    }

    this.loaded.push(module);
    this.bot.events.emit('moduleLoaded', module)
}

module.exports = ModuleLoader;
