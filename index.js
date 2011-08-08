require('coffee-script')

// Core
var Shell = module.exports = require('./lib/Shell');
Shell.styles = require('./lib/Styles');

// Plugins
Shell.cloud9 = require('./lib/plugins/cloud9');
Shell.coffee = require('./lib/plugins/coffee');
Shell.completer = require('./lib/plugins/completer');
Shell.error = require('./lib/plugins/error');
Shell.help = require('./lib/plugins/help');
Shell.history = require('./lib/plugins/history');
Shell.http = require('./lib/plugins/http');
Shell.router = require('./lib/plugins/router');
Shell.redis = require('./lib/plugins/redis');
Shell.test = require('./lib/plugins/test');

// Routes
Shell.routes = {
    shellOnly: require('./lib/routes/shellOnly')
};

Shell.Shell = function(settings){
    console.warn('Deprecated, use `shell()` instead of `shell.Shell()`');
    return new Shell( settings );
}