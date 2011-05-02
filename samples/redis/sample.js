#!/usr/bin/env node

    var spawn = require('child_process').spawn,
    	shell = require('shell'),
    	app = new shell.Shell(),
    	styles = app.styles;
    
	app.configure(function(){
		app.use( shell.history({shell: app}) );
		app.use( shell.completer({shell: app}) );
	});
	
	app.on('exit', function(){
		if(app.server){ app.server.kill(); }
		if(app.client){ app.client.quit(); }
	});
	
	app.cmd('start', 'Start the redis server', function(params, next){
		app.server = spawn('redis-server', [__dirname+'/redis.conf']);
		next();
	});
	
	app.cmd('keys :pattern', 'Find keys', function(params, next){
		if(!app.client){
			app.client = require('redis').createClient();
		}
		app.client.keys(params.pattern, function(err, keys){
			if(err){ return style.red(err.message), next(); }
			styles.cyan(keys.join('\n'));
			next();
		});
	});