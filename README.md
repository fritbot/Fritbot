Fritbot - The Angriest Bot
=========

Synergizer. Life Embetterment. Efficent. Helpful. Curteous. These are words that may be used to describe other popular chat robots. Not Fritbot.

Test Him Out!
----

In order to run Fritbot, you will need a [Mongo server](https://www.mongodb.org/downloads) running. This test section assumes you have it installed and running locally. For other implementations, see Advanced Setup.

Once you have the mongo server started, run `npm install fritbot fb-core-modules && node -e "new (require('fritbot').bot)()"` to check Fritbot out locally! Try 'say hi' or 'google fritbot', or 'help' for a full list of available functions. Want to try out [other modules](https://www.npmjs.com/browse/keyword/fritbot-module)? Install them with npm normally, then run `node -e "new (require('fritbot').bot)()"` again. No setup is required for many modules!

Under normal circumstances, of course, you'll want much more than this. The above code will run Fritbot in a shell, allowing you to test communication with the bot directly, but that isn't nearly as fun. For information setting up a full fledged Fritbot instance, configuring connectors, and deploying to services such as Heroku, see the next section.

But remember: never feed him after midnight.

Advanced Setup
---

The standard installation is only a starting point. You can do much more, starting with creating a bot instance folder, installing modules, and setting the configuration. In most cases, you can simply clone the [fb-instance template](https://github.com/Urthen/fb-instance) directory, or if you would like to check in your changes to version control, fork the template repo and then clone to that. This is your bot instance folder.

You'll also need [Mongo server](https://www.mongodb.org/downloads) running somewhere. If it is local on the default port, you do not need to change anything. If you have it running on another host and/or port, you will need to set the `db_url` config variable. See the "Core Configuration" section for information on this.

To install modules and connectors, you will simply need to add them to the `package.json` and run npm install as normal, then set up any configuration variables. The [fb-core-modules module](https://github.com/Urthen/fb-core-modules) is effectively required for bot functionality, other modules are optional. To add the [XMPP connector](https://github.com/Urthen/fb-xmpp-connector), for example, just add `"fb-xmpp-connector": ""` to the dependencies and run `npm install`. Create a `config.yml` file if you have not alraedy, and add the connection information specified in the connector readme. If you would like to pin to a specific version of a module, specify it as normal in the `package.json`.

Make sure you specify which rooms your bot should join! We highly recommend you create a bot test room for you to play with new modules, especially if you are developing them. Accidental infinite loops may make coworkers laugh but chat rooms cry.

Once you've set up the connector and any modules you would like, run the bot with `node index.js`. If everything works correctly, your bot should now connect to your server instead of opening a shell. Most common errors are reported sanely so you should hopefully be able to resolve any problems on your own.

Core Configuration
---

Most connectors and modules set up their own configuration variables, which can be found in the appropriate repositories. Some variables are part of the bot itself, however.

| Name | Description | Default |
|------|-------------|---------|
| name | Name of the bot | Fritbot |
| responds_to | List of names the bot responds to | ['fritbot', 'fb', 'bot'] |
| db_url | Mongo Database URL | mongodb://localhost:27017/fritbot |
| db_debug | Debug all calls to DB | false |
| locale | Localization option | en |
| node_directory | Node modules directory. Only used for testing. | node_modules |
| module_directory | Local modules directory. Only used for testing. | modules |

Configuration options are loaded in the following order:
* Default option (when specified in code)
* Read from config.yml
* Dynamic options passed to bot() call at runtime
* Environment variables - Config options are mapped by uppercasing and prefixing FB_, eg db_url -> FB_DB_URL


Deploying to Heroku
---

These instructions are designed for Heroku, but other cloud platforms should be supported via similar means. For Heroku, you will need to ensure `Procfile` exists and contains `web: node index.js` exactly - the default fb-instance template contains this. The file describes to Heroku how to launch Fritbot, which as you can see is just as simple as running it locally.

If you are using one of the Heroku Mongo Add-ons, for example MongoLab, you will need to copy the appropriate URI config variable (ex. `MONGOLAB_URI`) into the `DB_URL` config variable so Fritbot can pick it up appropriately.

Heroku employs a system where applications which have not recieved a request in a certain period of time are suspended. To prevent this, you will need to add the [Web UI](https://github.com/Urthen/fb-core-webui) installed with at minimum the Keepalive submodule enabled. The Keepalive submodule will cause the bot to periodically make a request to its own URL, thereby preventing the service from being suspended. See the Web UI readme for more setup information.

At this point, follow the standard [Heroku setup](https://devcenter.heroku.com/articles/getting-started-with-nodejs#deploy-the-app) to deploy your app to Heroku.

Core Development
---

If you are going to perform development on the Fritbot Core (this code), you'll want to fork & clone this repository. Run `npm install` at the root directory, then run `node testbot.js` from the root directory to run the self-contained shell test bot, which will allow limited testing of the bot itself but not usage of modules or connectors (including the core modules). To test it on your own bot instance and module set, you can link your forked package to your local instance by doing `npm link` from your fritbot folder, then `npm link fritbot` from your instance folder.

Module Development
---

Creating a module requires no special code or access. All modules in the `./modules/` and `./node_modules/` directories will be loaded. Creating your modules in `./modules` is useful for initial module development, or for modules that you do not expect to share with the world. Modules in `./node_modules/` are of course primarily loaded via NPM. Any file or directory in those directories that do not appear to be a valid Fritbot module will not be loaded.

If you are planning on releasing your module open source, you should create a separate repository for it, create a npm package for it, and include that package in your `package.json`. This way others can use your module simply by including it in their own package.json! To help get you started from a solid framework, as well as give more information on creating excellent modules, see the [Fritbot Module Master](https://github.com/Urthen/fritbot-module-master), which will template a skeleton module for you.
