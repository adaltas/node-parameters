
var fs = require('fs'),
    path = require('path');

module.exports = function(settings){
    // Validation
    if(!settings.shell){
        throw new Error('No shell provided');
    }
    var shell = settings.shell;
    // Plug completer to interface
    shell.interface.completer = function(text){
        var suggestions = [],
            routes = shell.routes;
        for(var i=0; i<routes.length; i++){
            var command = routes[i].command;
            if(command.substr(0, text.length) === text){
                suggestions.push(command);
            }
        }
        return [suggestions,text];
    }
};
