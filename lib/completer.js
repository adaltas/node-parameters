
var fs = require('fs'),
	path = require('path'),
	styles = require('./styles')();

module.exports = function(options){
	// Validation
	if(!options.shell){
		throw new Error('No shell provided');
	}
	var shell = options.shell;
	// Plug completer to interface
	shell.interface.completer = function(text){
		var suggestions = [],
			routes = shell.router.routes;
		for(var i=0; i<routes.length; i++){
			var command = routes[i].command;
			if(command.substr(0, text.length) === text){
				suggestions.push(command);
			}
		}
		return [suggestions,text];
	}
};
