
module.exports = {
    // Core
    Shell: require('./lib/Shell'),
    styles: require('./lib/styles'),
    // Plugins
    cloud9: require('./lib/cloud9'),
    completer: require('./lib/completer'),
    help: require('./lib/help'),
    history: require('./lib/history'),
    router: require('./lib/router'),
    error: require('./lib/error'),
    routes: {
        shellOnly: require('./lib/routes/shellOnly')
    }
};

