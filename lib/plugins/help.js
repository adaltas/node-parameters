var utils;
utils = require('../utils');
module.exports = function(settings) {
  var shell, text;
  if (!settings.shell) {
    throw new Error('No shell provided');
  }
  shell = settings.shell;
  shell.help = function(req, res, next) {
    var route, routes, tetx, _i, _len;
    res.cyan('Available commands:');
    res.ln();
    routes = shell.routes;
    for (_i = 0, _len = routes.length; _i < _len; _i++) {
      route = routes[_i];
      tetx = utils.pad(route.command, 20);
      if (route.description) {
        res.cyan(text).white(route.description).ln();
      }
    }
    return res.prompt();
  };
  shell.cmd('help', 'Show this message', shell.help.bind(shell));
  shell.cmd('', shell.help.bind(shell));
  if (shell.isShell && settings.introduction) {
    text = typeof settings.introduction === 'string' ? settings.introduction : 'Type "help" or press enter for a list of commands';
    return shell.styles.println(text);
  }
};