# Shell - Full features and pretty console applications

Create nice looking shell applications in minutes with a Connect inspired API.

## Quick exemple, a redis client

    var spawn = require('child_process').spawn,
    	shell = require('shell'),
    	app = new shell.Shell(),
    	styles = app.styles;
    
	app.configure(function(){
		app.use( shell.history({shell: app}) );
		app.use( shell.completer({shell: app}) );
		app.use( shell.help({shell: app, introduction: true}) );
	});
	
	app.on('exit', function(){
		if(app.server){ app.server.kill(); }
		if(app.client){ app.client.quit(); }
	});
	
	app.cmd('start', 'Start the redis server', function(req, next){
		app.server = spawn('redis-server', [__dirname+'/redis.conf']);
		next();
	});
	
	app.cmd('keys :pattern', 'Find keys', function(req, next){
		if(!app.client){
			app.client = require('redis').createClient();
		}
		app.client.keys(req.params.pattern, function(err, keys){
			if(err){ return style.red(err.message), next(); }
			styles.cyan(keys.join('\n')||'no keys');
			next();
		});
	});

## Installation

	`npm install shell`

## Creating and configuring

	var app = new shell.Shell();
	
	app.configure(function(){
		app.use( shell.history({shell: app}) );
		app.use( shell.completer({shell: app}) );
		app.use( shell.help({shell: app, introduction: true}) );
	});

The constructor `shell.Shell` take an optional object. options are
-	*stdin*, Source to read from
-	*stdout*, Destination to write to

Like with Express, `app.configure` allows the customization of plugins for different environments (however, it is not yet implemented) while `app.use` register plugins.

## Routes

A route is made of a command pattern, an optional description and one or more route specific middleware.

Middlewares recieve three parameters, a request object, a response object and a function.

The request object contains the following properties:
-	*command*, command entered by the user
-	*params*, parameters object extracted from the command

The response object inherit from styles which contains various utility functions for printing, coloring and bolding.

## History plugin

Persist command history between multiple sessions. Options passed during creation are:
-	*shell*, required
-	*historyFile*, default to `process.cwd()+'/.node_shell'`

## Completer plugin

Provide tab completion. Options passed during creation are:
-	*shell*, required

## Help plugin

Display help when use type "help" or when he press `enter` on empty prompt. Command help is only displayed if a description was provided during the command registration. Additionnaly, a new `shell.help()` function is made available. Options passed during creation are:
-	*shell*, required
-	*introduction*, Print message 'Type "help" or press enter for a list of commands' if boolean true or a custom message if a string


