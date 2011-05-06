
module.exports = function(options){
  // Validation
  if(!options.shell){
    throw new Error('No shell provided');
  }
  var shell = options.shell;
  // Register function
  shell.help = function(req, res, next){
    res.cyan('Available commands:').ln();
    var routes = shell.routes;
    for(var i=0; i<routes.length; i++){
      var route = routes[i];
      if(route.description){
        res.cyan(shell.pad(route.command, 20)).white(route.description).ln();
      }
    }
    res.prompt();
  }
  // Register commands
  shell.cmd('help', 'Show this message', shell.help.bind(shell));
  shell.cmd('', shell.help.bind(shell));
  // Print introduction message
  if(shell.isShell && options.introduction){
    shell.styles.println(
      typeof options.introduction === 'string' ? 
      options.introduction : 
      'Type "help" or press enter for a list of commands'
    );
  }
};

