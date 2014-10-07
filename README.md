Fritbot - The Angriest Bot
=========

Synergizer. Life Embetterment. Efficent. Helpful. Curteous. These are words that may be used to describe other popular chat robots. Not Fritbot.

Standard Installation
----

Basic local setup: `npm install fritbot` then `require('fritbot').bot();` in a node REPL to check it out locally!

You'll want a much more advanced config than this, obviously. More information will come shortly.

And never feed him after midnight.

Advanced Setup
---

The standard installation is only a starting point. You can do much more, including incorporating the bot into a larger project and passing it in a configuration object. More information to come soon.

Module Development
---

You can perform module development from a standard installation as well. All modules in the `./modules/` directory will be loaded, and the standard fb-instance template already has one test module created for you to look at. This is useful for initial module development, or for modules that you do not expect to share with the world.

If you are planning on releasing your module open source, you should create a separate repository for it, create a npm package for it, and include that package in your `package.json`. This way others can use your module simply by including it in their own package.json!

Core Development
---

If you are going to perform development on the Fritbot Core (this code), you'll want to fork & clone this repository. Run `npm install` at the root directory, then run `node testbot.js` from `./test/` to run the self-contained test bot. By default it will use the shell connector, but you can change the configuration on your machine if you would like for testing purposes. Please make sure to revert any config change you make before opening a pull request!