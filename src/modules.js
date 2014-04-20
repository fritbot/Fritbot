var fs = require('fs');

function ModuleLoader(bot) {
	this.bot = bot;
	this.loaded = [];

    var modules = fs.readdirSync(this.bot.config.module_directory),
    	name, module, package_json = undefined;
    for(var i = 0; i < modules.length; i++){
        name = this.bot.config.module_directory+'/'+modules[i];
       
        try {
        	module = require(name)
        } catch (e) {
        	console.log("Error importing module:", name);
        	throw e;
        }

        try {
        	package_json = require(name + "/package.json");
        } catch (e) {
        	package_json = undefined;
        	console.log("Error loading package.json for", name, ", ignoring")
        }
        
        try {
        	if (Object.prototype.toString.call( module ) === '[object Array]') {
        		for (var ii = 0; ii < module.length; ii++) {
        			this.loadModule(module[ii], package_json);
        		}
        	} else {
        		this.loadModule(module, package_json);	
        	}
        } catch (e) {
        	console.log("Error registering module:", name);
        	throw e;
        }
    }
}

ModuleLoader.prototype.loadModule = function (module, package_json) {
	module.bot = this.bot;

	for(var prop in package_json) {
		if(package_json.hasOwnProperty(prop) && !module.hasOwnProperty(prop)) {
			module[prop] = package_json[prop]
		}
	}

	if (module.init) {
		module.init();
	}

    if (module.commands) {
        for (var i = 0; i < module.commands.length; i++) {
            module.commands[i].origin = module;
            this.bot.intent.loadCommand(module.commands[i]);
        }
    }

	this.loaded.push(module);
    this.bot.events.emit('moduleLoaded', module)
}

module.exports = ModuleLoader;
