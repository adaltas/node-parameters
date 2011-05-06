#!/usr/bin/env node

    var spawn = require('child_process').spawn,
    	shell = require('shell'),
    	app = new shell.Shell();
    
	app.configure(function(){
		app.use( shell.history({shell: app}) );
		app.use( shell.completer({shell: app}) );
		app.use( shell.router({shell: app}) );
		app.use( shell.help({shell: app, introduction: true}) );
		app.use( shell.error({shell: app}) );
	});
	
	app.on('exit', function(){
		if(app.server){ app.server.kill(); }
		if(app.client){ app.client.quit(); }
	});
	
	app.cmd('start', 'Start the redis server', function(req, res, next){
		app.server = spawn('redis-server', [__dirname+'/redis.conf']);
		res.prompt();
	});
	
	app.cmd('keys :pattern', 'Find keys', function(req, res, next){
		if(!app.client){
			app.client = require('redis').createClient();
		}
		app.client.keys(req.params.pattern, function(err, keys){
			if(err){ return res.styles.red(err.message), next(); }
			res.cyan(keys.join('\n')||'no keys');
			res.prompt();
		});
	});