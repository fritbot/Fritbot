// Internationalization Service

var _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml'),
    util = require('util');

function I18nService(bot) {
    this.bot = bot;
    this.dicts = {};

    this.bot.events.on('moduleLoaded', this.loadModule.bind(this));
}

I18nService.prototype.loadModule = function (module, pathname) {
    if (pathname) {
        var langpath = path.join(pathname, 'lang');
        if (fs.existsSync(langpath)) {
            this.loadLangFiles(langpath);
        }
    }
};

I18nService.prototype.loadLangFiles = function (dir) {
    _.forEach(fs.readdirSync(dir), function (file) {
        var fullpath = path.join(dir, file);
        var locale = path.basename(file, path.extname(file));
        var dict;

        console.log('Loading localization file', fullpath);
        try {
            dict = yaml.safeLoad(fs.readFileSync(fullpath, 'utf8'));
        } catch (e) {
            console.log('Error parsing locale file:', fullpath);
            throw e;
        }

        if (!this.dicts[locale]) {
            this.dicts[locale] = dict;
        } else {
            this.dicts[locale] = _.merge(dict, this.dicts[locale]);
        }

    }.bind(this));
};

I18nService.prototype.doTemplate = function (key, args, locale) {
    var template = this.getTemplate(key, locale);
    if (util.isArray(template)) {
        template = _.sample(template);
    }

    args.unshift(template);
    return util.format.apply(util, args);
};

// Get a template identified by key, for specified language.
// If only one parameter is passed, gets template for the default language.
I18nService.prototype.getTemplate = function (key, locale) {
    // Allow for single-argument calls
    if (!locale) {
        locale = this.bot.config.locale;
    }

    // Setup order we will visit locale dicts in
    var order = [locale];

    if (locale !== this.bot.config.locale) {
        order.push(this.bot.config.locale);
    }

    if (locale !== 'en') {
        order.push('en');
    }

    var ordered_dicts = _.map(order, function (locale) {
        return this.dicts[locale];
    }.bind(this));

    var result = _.result(_.find(ordered_dicts, key), key);

    if (!result) {
        throw new Error('Could not find locale key ' + key + ' in ' + order.join(', '));
    }

    return result;
};



module.exports = I18nService;