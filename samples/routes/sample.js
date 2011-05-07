#!/usr/bin/env node

  var spawn = require('child_process').spawn,
      shell = require('shell'),
      app = new shell.Shell();
    
  app.configure(function(){
    app.use( shell.router({shell: app}) );
    app.use( shell.help({shell: app, introduction: true}) );
    app.use( shell.error({shell: app}) );
  });
  
  app.on('exit', function(){
    if(app.server){ app.server.kill(); }
    if(app.client){ app.client.quit(); }
  });
  
  app.cmd('multiple', 'Test multiple routes', function(req, res, next){
    res.cyan('middleware 1').ln();
    next();
  }, function(req, res, next){
    res.cyan('middleware 2').ln();
    next();
  }, function(req, res, next){
    res.cyan('final callback').ln();
    res.prompt();
  });
  