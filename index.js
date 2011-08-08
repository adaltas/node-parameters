require('coffee-script')

module.exports = {
    // Core
    Shell: require('./lib/Shell'),
    styles: require('./lib/Styles'),
    // Plugins
    cloud9: require('./lib/plugins/cloud9'),
    coffee: require('./lib/plugins/coffee'),
    completer: require('./lib/plugins/completer'),
    error: require('./lib/plugins/error'),
    help: require('./lib/plugins/help'),
    history: require('./lib/plugins/history'),
    http: require('./lib/plugins/http'),
    router: require('./lib/plugins/router'),
    redis: require('./lib/plugins/redis'),
    test: require('./lib/plugins/test'),
    routes: {
        shellOnly: require('./lib/routes/shellOnly')
    }
};

