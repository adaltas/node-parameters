
module.exports = {
    // Core
    Shell: require('./lib/Shell'),
    styles: require('./lib/styles'),
    // Plugins
    cloud9: require('./lib/plugins/cloud9'),
    completer: require('./lib/plugins/completer'),
    error: require('./lib/plugins/error'),
    help: require('./lib/plugins/help'),
    history: require('./lib/plugins/history'),
    router: require('./lib/plugins/router'),
    routes: {
        shellOnly: require('./lib/routes/shellOnly')
    }
};

