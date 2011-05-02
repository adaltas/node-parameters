# Shell - Framework for console based application

Create nice looking shell applications in minutes with a Connect inspired API.

## Quick exemple, a redis client

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

## Creating and configuring

	var app = new shell.Shell();
	
	app.configure(function(){
		app.use( shell.history({shell: app}) );
		app.use( shell.completer({shell: app}) );
	});

The constructor `shell.Shell` take an optional object. options are
*	stdin	Source to read from
*	stdout	Destination to write to

Like with Express, `app.configure` allows the customization of plugins for different environments (however, it is not yet implemented) while `app.use` register plugins.

## History plugin

Persist command history between multiple sessions. Options passed during creation are:
*	shell (required)
*	historyFile, default to `process.cwd()+'/.node_shell'`

## Completer plugin

Provide tab completion. Options passed during creation are:
*	shell (required)
