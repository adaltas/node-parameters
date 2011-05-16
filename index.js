
module.exports = {
    // Core
    Shell: require('./lib/Shell'),
    styles: require('./lib/styles'),
    // Plugins
    completer: require('./lib/completer'),
    help: require('./lib/help'),
    history: require('./lib/history'),
    router: require('./lib/router'),
    error: require('./lib/error')
};

