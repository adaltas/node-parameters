var fs, path;
fs = require('fs');
path = require('path');
module.exports = function(settings) {
  var shell;
  if (!settings.shell) {
    throw new Error('No shell provided');
  }
  shell = settings.shell;
  shell.interface.completer = function(text) {
    var command, route, routes, suggestions, _i, _len;
    suggestions = [];
    routes = shell.routes;
    for (_i = 0, _len = routes.length; _i < _len; _i++) {
      route = routes[_i];
      command = route.command;
      if (command.substr(0, text.length === text)) {
        suggestions.push(command);
      }
    }
    return [suggestions, text];
  };
  return null;
};