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

## Shell settings

The constructor `shell` take an optional object. Options are:

-   `chdir`      , Changes the current working directory of the process, a string of the directory, boolean true will default to the `workspace` (in which case `workspace` must be provided or discoverable)
-   `prompt`     , Character for command prompt, Defaults to ">>"
-   `stdin`      , Source to read from
-   `stdout`     , Destination to write to
-   `env`        , Running environment, Defaults to the `env` setting (or `NODE_ENV` if defined, eg: `production`, `develepment`).
-   `isShell`    , Detect whether the command is runned inside a shell are as a single command.
-   `noPrompt`   , Do not prompt the user for a command, usefull to plug your own starting mechanisme (eg: starting with a question).
-   `workspace`  , Project root directory or null if none was found. The discovery strategy start from the current working directory and traverse each parent dir looking for a `node_module` directory or a `package.json` file.

Shell settings may be set by calling `app.set('key', value)`.  They can be retrieved by calling the same function without a second argument.

```javascript
var app = new shell({
    chdir: true
});
app.set('env', 'prod');
app.configure('prod', function() {
    console.log(app.set('env'));
});
```

As with Express, `app.configure` allows the customization of plugins for all or specific environments, while `app.use` registers plugins.

If `app.configure` is called without specifying the environment as the first argument, the provided callback is always called. Otherwise, the environment must match the `env` setting or the global variable `NODE_ENV`.

## Shell events

By extending `EventEmitter`, the following events are emitted:

-   `"command"`  , listen to all executed commands, provide the command name as first argument.
-   `#{command}` , listen to a particular event.
-   `"quit"`     , called when the application is about to quit.
-   `"error"`    , called on error providing the error object as the first callback argument.
-   `"exit"`     , called when the process exit.

## Router plugin

The functionalities are a full transcription of the ones present Express. Options passed during creation are:

-   `shell`     , (required) A reference to your shell application.
-	`sensitive` , (optional) Defaults to `false`, set to `true` if the match should be case sensitive.

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

-   `shell`   , (required) A reference to your shell application.
-   `command` , Command entered by the user
-   `params`  , Parameters object extracted from the command, defined by the `shell.router` middleware

The response object inherits from styles containing methods for printing, coloring and bolding:

Colors:

-   `black`
-   `white`
-   `yellow`
-   `blue`
-   `cyan`
-   `green`
-   `magenta`
-   `red`
-   `bgcolor`
-   `color`
-   `nocolor`

Style:

-   `regular`
-   `weight`
-   `bold`

Display:

-   `prompt`  , Exits the current command and return user to the prompt.
-   `ln`
-   `print`
-   `println`
-   `constructor`
-   `reset`
-   `pad`
-   `raw`

## History plugin

Persistent command history over multiple sessions. Options passed during creation are:

-   `shell` , (required) A reference to your shell application.
-   `name`  , Identify your project history file, default to the hash of the exectuted file
-	`dir`   , Location of the history files, defaults to `"#{process.env['HOME']}/.node_shell"`

## Completer plugin

Provides tab completion. Options passed during creation are:

-	`shell` , (required) A reference to your shell application.

## Help plugin

Display help when the user types "help" or runs commands without arguments. Command help is only displayed if a description was provided during the command registration. 

Additionnaly, a new `shell.help()` function is made available. Options passed during creation are:

-	`shell`        , (required) A reference to your shell application.
-	`introduction` , Print message 'Type "help" or press enter for a list of commands' if boolean `true`, or a custom message if a `string`

## HTTP server

Register two commands, `http start` and `http stop`. The start command will search for "./server.js" and "./app.js" (and additionnaly their CoffeeScript alternatives) to run by `node`.The following properties may be provided as settings:

-	`config`   , Path to the configuration file. Required to launch redis.
-	`detach`   , Wether the HTTP process should be attached to the current process. If not defined, default to `true` in shell mode and `false` in command mode.
-	`pidfile`  , Path to the file storing the detached process id. Defaults to `"/.node_shell/#{md5}.pid"`
-	`stdout`   , Writable stream or file path to redirect the server stdout.
-	`stderr`   , Writable stream or file path to redirect the server stderr.
-	`workspace`, Project directory used to resolve relative paths and search for "server" and "app" scripts.

Example:

```javascript
var app = new shell();
app.configure(function() {
    app.use(shell.router({
        shell: app
    }));
    app.use(shell.http({
        shell: app
    }));
    app.use(shell.help({
        shell: app,
        introduction: true
    }));
});
```

## Redis plugin

Register two commands, `redis start` and `redis stop`. The following properties may be provided as settings:

-	`config` Path to the configuration file. Required to launch redis.
-	`detach` Wether the Redis process should be attached to the current process. If not defined, default to `true` in shell mode and `false` in command mode.
-	`pidfile` Path to the file storing the detached process id. Defaults to `"/.node_shell/#{md5}.pid"`
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

-	`config` Load the configuration from a config file. Overrides command-line options. Defaults to `null`.
-	`group` Run child processes with a specific group.
-	`user` Run child processes as a specific user.
-	`action` Define an action to execute after the Cloud9 server is started. Defaults to `null`.
-	`ip` IP address where Cloud9 will serve from. Defaults to `"127.0.0.1"`.
-	`port` Port number where Cloud9 will serve from. Defaults to `3000`.
-	`workspace` Path to the workspace that will be loaded in Cloud9, Defaults to `Shell.set('workspace')`.
-	`detach` Wether the Cloud9 process should be attached to the current process. If not defined, default to `true` in shell mode and `false` in command mode.
-	`pidfile` Path to the file storing the detached process id. Defaults to `"/.node_shell/#{md5}.pid"`
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

**Important:** If you encounter issue while installing cloud9, it might be because the npm module expect an older version of Node. 

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
-	`detach` Wether the Coffee process should be attached to the current process. If not defined, default to `true` in shell mode and `false` in command mode.
-	`pidfile` Path to the file storing the detached process id. Defaults to `"/.node_shell/#{md5}.pid"`
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

## Prompt route

The `prompt` route is a convenient function to stop command once a few routes are executed. You can simply pass the the `shell.routes.prompt` function or call it with a message argument.

```javascript
var app = new shell();
app.configure(function() {
    app.use(shell.router({
        shell: app
    }));
});
app.cmd('install', [
	my_app.routes.download,
	my_app.routes.configure,
    shell.routes.prompt('Installation is finished')
]);
```

## Confirm route

The `confirm` route ask the user if he want to continue the process. If the answer is `true`, the following routes are executed. Otherwise, the process is stoped.

```javascript
var app = new shell();
app.configure(function() {
    app.use(shell.router({
        shell: app
    }));
});
app.cmd('install', [
    shell.routes.confirm('Do you confirm?'),
    my_app.routes.download,
	my_app.routes.configure
]);
```

## Timeout route

The `timeout` route will wait for the provided period (in millisenconds) before executing the following route.

```javascript
var app = new shell();
app.configure(function() {
    app.use(shell.router({
        shell: app
    }));
});
app.cmd('restart', [
    my_app.routes.stop,
    shell.routes.timeout(1000),
    my_app.routes.start
]);
```
