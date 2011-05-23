
var utils = require('../utils')

module.exports = function(settings){
    // Validation
    if(!settings.shell){
        throw new Error('No shell provided');
    }
    var shell = settings.shell;
    // Register function
    shell.help = function(req, res, next){
        res.cyan('Available commands:').ln();
        var routes = shell.routes;
        for(var i=0; i<routes.length; i++){
            var route = routes[i];
            if(route.description){
                res.cyan(utils.pad(route.command, 20)).white(route.description).ln();
            }
        }
        res.prompt();
    }
    // Register commands
    shell.cmd('help', 'Show this message', shell.help.bind(shell));
    shell.cmd('', shell.help.bind(shell));
    // Print introduction message
    if(shell.isShell && settings.introduction){
        shell.styles.println(
            typeof settings.introduction === 'string' ? 
            settings.introduction : 
            'Type "help" or press enter for a list of commands'
        );
    }
};

