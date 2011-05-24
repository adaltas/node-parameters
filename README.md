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
-   *stdin*, Source to read from
-   *stdout*, Destination to write to

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
-   *isShell*, detect wether the command is runned inside a shell are as a single command.
-   *project_dir*, return the project root directory path or null if node was found. The discovery strategy start from the current directory and traverse each parent dir looking for a a node_module dir or a package.json file.

## Routes plugin

A route is made of a command pattern, an optional description and one or more route specific middleware.

Middlewares recieve three parameters, a request object, a response object and a function.

The request object contains the following properties:
-   *command*, command entered by the user
-   *params*, parameters object extracted from the command

The response object inherit from styles which contains various utility functions for printing, coloring and bolding.

## History plugin

Persist command history between multiple sessions. Options passed during creation are:
-   *shell*, required
-   *historyFile*, default to `process.cwd()+'/.node_shell'`

## Completer plugin

Provide tab completion. Options passed during creation are:
-   *shell*, required

## Help plugin

Display help when use type "help" or when he press `enter` on empty prompt. Command help is only displayed if a description was provided during the command registration. Additionnaly, a new `shell.help()` function is made available. Options passed during creation are:
-   *shell*, required
-   *introduction*, Print message 'Type "help" or press enter for a list of commands' if boolean true or a custom message if a string

## Redis plugin

Register two commands, `redis start` and `redis stop`. The following properties may be provided as settings:

-   *shell*, required, a reference to your shell application.
-   *config*, path to the configuration file. Required to launch redis.
-   *detach*, Preserve the Cloud9 process when exiting the shell, only apply in shell mode.
-   *pidfile*, Path to the file storing the process id, apply in command mode or in shell if option "detach" is true. Default to "/tmp/cloud9.pid"
-   *stdout*, writable stream or file path to redirect cloud9 stdout.
-   *stderr*, writable stream or file path to redirect cloud9 stderr.

Exemple:
    
    var app = new shell.Shell();
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

## Cloud9 plugin

Register two commands, `cloud9 start` and `cloud9 stop`. The following properties may be provided as settings:

-   *shell*, required, a reference to your shell application.
-   *config*, load the configuration from a config file. Overrides command-line options. Default to `null`.
-   *detach*, Preserve the Cloud9 process when exiting the shell, only apply in shell mode.
-   *pidfile*, Path to the file storing the process id, apply in command mode or in shell if option "detach" is true. Default to "/tmp/cloud9.pid"
-   *group*, Run child processes with a specific group
-   *user*, Run child processes as a specific user.
-   *action*, Define an action to execute after the Cloud9 server is started. Default to `null`.
-   *ip*, IP address where Cloud9 will serve from. Default to `"127.0.0.1"`.
-   *port*, Port number where Cloud9 will serve from. Default to `3000`.
-   *workspace*, path to the workspace that will be loaded in Cloud9, Default to `Shell.set('project_dir')`.
-   *stdout*, writable stream or file path to redirect cloud9 stdout.
-   *stderr*, writable stream or file path to redirect cloud9 stderr.

Exemple:
    
    var app = new shell.Shell();
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

Important, cloud9 must be installed as a NPM module but there's a problem. At the moment, the NPM module is based on the master branch of cloud9 on GitHub and is expecteding a Node version of 0.4.1. Here's the procedure to use a newer version:

    git clone https://github.com/ajaxorg/cloud9.git
    git checkout -b devel origin/devel
    npm link


