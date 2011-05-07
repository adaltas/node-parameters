#!/usr/bin/env node

  var shell = require('shell')
    , app = new shell.Shell()
    , users = {
        '1': 'lulu'
      , '2': 'toto'
      };
    
  app.configure(function(){
    app.use( shell.router({shell: app}) );
    app.use( shell.help({shell: app, introduction: true}) );
    app.use( shell.error({shell: app}) );
  });
  
  app.on('exit', function(){
    if(app.server){ app.server.kill(); }
    if(app.client){ app.client.quit(); }
  });
  
  app.param('userId', function(req, res, next){
    var user = users[req.params.userId];
    if( user ){
      req.user = user;
      next();
    }else{
      next( new Error('User does not exist') );
    }
  });
  
  app.cmd('show user :userId', 'Example, type "show user 2"', function(req, res, next){
    res.cyan('User is '+req.user).ln();
    res.prompt();
  });
  