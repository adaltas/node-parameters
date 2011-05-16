# Shell - Full features and pretty console applications

Create nice looking shell applications in minutes with Connect/Express inspired API and functionnalities.

## Quick exemple, a redis client

    var spawn = require('child_process').spawn,
    	shell = require('shell'),
    	app = new shell.Shell();
    
	app.configure(function(){
		app.use(shell.history({shell: app}));
		app.use(shell.completer({shell: app}));
		app.use(shell.router({shell: app}));
		app.use(shell.help({shell: app, introduction: true}));
		app.use(shell.error({shell: app}));
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

## Installation

	`npm install shell`

## Creating and configuring

	var app = new shell.Shell();
	app.configure(function() {
		app.use(shell.history({shell: app}));
		app.use(shell.completer({shell: app}));
		app.use(shell.help({shell: app, introduction: true}));
	});
	app.configure('prod', function() {
		app.set('title', 'Production Mode');
	});

The constructor `shell.Shell` take an optional object. options are
-	*stdin*, Source to read from
-	*stdout*, Destination to write to

Like with Express, `app.configure` allows the customization of plugins for all or specific environments while `app.use` register plugins.

If `app.configure` is called without specifying the environment as the first argument, the provided callback will always be called. Otherwise, the environment must match the global variable `NODE_ENV` or the `env` setting.

## Shell settings

Shell settings may be set by calling `app.set('key', value)` and may be retrieved by calling the same function without a second argument.

	var app = new shell.Shell();
	app.set('env', 'prod');
	app.configure('prod', function() {
		console.log(app.set('env'));
	});

-   *env*, the running environment, default to `NODE_ENV` if defined.
-	*isShell*, detect wether the command is runned inside a shell are as a single command.
-	*project_dir*, return the project root directory path or null if node was found. The discovery strategy start from the current directory and traverse each parent dir looking for a a node_module dir or a package.json file.

## Routes plugin

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


