# Shell - Nice looking shell applications with pluggable middlewares.

The project brings a Connect/Express inspired API and similar functionnalities to console based applications.

## Quick Example, a redis client

```javascript
    var shell = require('shell');
    // Initialization
    var app = new shell();
    // Plugins registration
    app.configure(function() {
        app.use(shell.history({
            shell: app
        }));
        app.use(shell.completer({
            shell: app
        }));
        app.use(shell.router({
            shell: app
        }));
        app.use(shell.redis({
            shell: app,
            config: 'redis.conf',
            pidfile: 'redis.pid'
        }));
        app.use(shell.help({
            shell: app,
            introduction: true
        }));
    });
    // Command registration
    app.cmd('redis keys :pattern', 'Find keys', function(req, res, next){
        if(!app.client){
            app.client = require('redis').createClient();
        }
        app.client.keys(req.params.pattern, function(err, keys){
            if(err){ return res.styles.red(err.message), next(); }
            res.cyan(keys.join('\n')||'no keys');
            res.prompt();
        });
    });
    // Event notification
    app.on('redis quit', function(){
        if(app.client){
            app.client.quit();
        }
    });
```

## Installation

```bash
    npm install shell
```

## Creating and Configuring a Shell

```javascript
    var app = new shell();
    app.configure(function() {
        app.use(shell.history({shell: app}));
        app.use(shell.completer({shell: app}));
        app.use(shell.help({shell: app, introduction: true}));
    });
    app.configure('prod', function() {
        app.set('title', 'Production Mode');
    });
```

The constructor `shell` take an optional object. Options are:

-    `env`   , defined the running environment
-	`prompt`, Character for command prompt, Defaults to ">>"
-   `stdin` , Source to read from
-   `stdout`, Destination to write to

As with Express, `app.configure` allows the customization of plugins for all or specific environments, while `app.use` registers plugins.

If `app.configure` is called without specifying the environment as the first argument, the provided callback is always called. Otherwise, the environment must match the `env` setting or the global variable `NODE_ENV`.

## Shell settings

Shell settings may be set by calling `app.set('key', value)`.  They can be retrieved by calling the same function without a second argument.

```javascript
    var app = new shell();
    app.set('env', 'prod');
    app.configure('prod', function() {
        console.log(app.set('env'));
    });
```

-   `env`, the running environment, Defaults to the `env` setting (or `NODE_ENV` if defined).
-   `isShell`, detect whether the command is runned inside a shell are as a single command.
-   `project_dir`, return the project root directory path or null if node was found. The discovery strategy start from the current directory and traverse each parent dir looking for a a node_module dir or a package.json file.

## Shell events

By extending `EventEmitter`, the following events are emitted:

-   `"command"`, listen to all executed commands, provide the command name as first argument
-   `#{command}`, listen to a particular event
-   `"exit"`, called on application exit

## Routes plugin

The functionalities are a full transcription of the ones present Express. Options passed during creation are:

-   `shell` (required)
-	`sensitive` (optional) Defaults to `false`, set to `true` if the match should be case sensitive.

New routes are defined with the `cmd` method. A route is made of pattern against which the user command is matched, an optional description and one or more route specific middlewares to handle the command. The pattern is either a string or a regular expression. Middlewares receive three parameters: a request object, a response object, and a function. Command parameters are substituted and made available in the `params` object of the request parameter.

```javascript
    var app = new shell();
    app.configure(function(){
        app.use(shell.router({
            shell: app
        }));
    });
    // Route middleware
    var auth = function(req, res, next){
    	if(req.params.uid == process.getuid()){
    		next()
    	}else{
    		throw new Error('Not me');
    	}
    }
    // Global parameter substitution
    app.param('uid', function(req, res, next){
    	exec('whoami', function(err, stdout, sdterr){
    		req.params.username = stdout;
    		next();
    	});
    });
    // Simple command
    app.cmd('help', function(req, res){
    	res.cyan('Run this command `./ami user ' + process.getuid() + '`');
    	res.prompt()
    });
    // Command with parameter and two route middlewares
    app.cmd('user :uid', auth, function(req, res){
    	res.cyan('Yes, you are ' + req.params.username);
    });
```

The request object contains the following properties:

-   `command`, command entered by the user
-   `params`, parameters object extracted from the command

The response object inherits from styles containing various utilities for printing, coloring and bolding.

## History plugin

Persistent command history over multiple sessions. Options passed during creation are:

-   `shell`, required
-	`historyFile` Defaults to `process.cwd()+'/.node_shell'`

## Completer plugin

Provides tab completion. Options passed during creation are:

-	`shell` required

## Help plugin

Display help when the user types "help" or runs commands without arguments. Command help is only displayed if a description was provided during the command registration. 

Additionnaly, a new `shell.help()` function is made available. Options passed during creation are:

-	`shell` required
-	`introduction` Print message 'Type "help" or press enter for a list of commands' if boolean `true`, or a custom message if a `string`

## HTTP server

Register two commands, `http start` and `http stop`. The start command will search for "./server.js" and "./app.js" to run by `node`.
    
```javascript
    var app = new shell();
    app.configure(function() {
        app.use(shell.router({
            shell: app
        }));
        app.use(shell.redis({
            shell: app,
            config: __dirname+'/redis.conf')
        }));
        app.use(shell.help({
            shell: app,
            introduction: true
        }));
    });
```

## Redis plugin

Register two commands, `redis start` and `redis stop`. The following properties may be provided as settings:

-	`shell` (required)  a reference to your shell application.
-	`config` Path to the configuration file. Required to launch redis.
-	`detach` Preserve the Cloud9 process when exiting the shell, only apply in shell mode.
-	`pidfile` Path to the file storing the process id, apply in command mode or in shell if option `detach` is `true`. Defaults to "/tmp/cloud9.pid"
-	`stdout` Writable stream or file path to redirect cloud9 stdout.
-	`stderr` Writable stream or file path to redirect cloud9 stderr.

Example:
    
```javascript
    var app = new shell();
    app.configure(function() {
        app.use(shell.router({
            shell: app
        }));
        app.use(shell.redis({
            shell: app,
            config: __dirname+'/redis.conf')
        }));
        app.use(shell.help({
            shell: app,
            introduction: true
        }));
    });
```

## Cloud9 plugin

Register two commands, `cloud9 start` and `cloud9 stop`. Unless provided, the Cloud9 workspace will be automatically discovered if your project root directory contains a "package.json" file or a "node_module" directory.

Options:

-	`shell` (required)  a reference to your shell application.
-	`config` Load the configuration from a config file. Overrides command-line options. Defaults to `null`.
-	`pidfile` Path to the file storing the process id, apply in command mode or in shell if option `detach` is `true`. Defaults to `"/tmp/cloud9.pid"`.
-	`group` Run child processes with a specific group.
-	`user` Run child processes as a specific user.
-	`action` Define an action to execute after the Cloud9 server is started. Defaults to `null`.
-	`ip` IP address where Cloud9 will serve from. Defaults to `"127.0.0.1"`.
-	`port` Port number where Cloud9 will serve from. Defaults to `3000`.
-	`workspace` Path to the workspace that will be loaded in Cloud9, Defaults to `Shell.set('project_dir')`.
-	`detach` Preserve the Cloud9 process when exiting the shell. Only applies in shell mode.
-	`stdout` Writable stream or file path to redirect cloud9 stdout.
-	`stderr` Writable stream or file path to redirect cloud9 stderr.

Example:
    
```javascript
    var app = new shell();
    app.configure(function() {
        app.use(shell.router({
            shell: app
        }));
        app.use(shell.cloud9({
            shell: app,
            ip: '0.0.0.0'
        }));
        app.use(shell.help({
            shell: app,
            introduction: true
        }));
    });
```

**Important:** cloud9 must be installed with npm—but there's a problem. Currently, the npm module is based on the master branch of cloud9 on GitHub (version "0.3.0"), and expects Node version 0.4.1. 

Here's the procedure to use the newer version on the devel branch:

```
    git clone https://github.com/ajaxorg/cloud9.git
    cd cloud9
    git checkout -b devel origin/devel
    git submodule update --init --recursive
    npm link
```

## CoffeeScript plugin

Start Coffee in `--watch` mode, so scripts are instantly compiled into Javascript.

Options:

-	`src` Directory where ".coffee" are stored. Each ".coffee" script will be compiled into a .js JavaScript file of the same name.
-	`output` Directory where compiled JavaScript files are written. Used in conjunction with "compile".
-	`lint` If the `jsl` (JavaScript Lint) command is installed, use it to check the compilation of a CoffeeScript file.
-	`require` Load a library before compiling or executing your script. Can be used to hook in to the compiler (to add Growl notifications, for example).
-	`detach` Preserve the CoffeeScript process when exiting the shell. Only applies in shell mode.
-	`stdout` Writable stream or file path to redirect cloud9 stdout.
-	`stderr` Writable stream or file path to redirect cloud9 stderr.
-	`workspace` Project directory used to resolve relative paths.

Example:

```javascript
    var app = new shell();
    app.configure(function() {
        app.use(shell.router({
            shell: app
        }));
        app.use(shell.coffee({
            shell: app
        }));
        app.use(shell.help({
            shell: app,
            introduction: true
        }));
    });
```