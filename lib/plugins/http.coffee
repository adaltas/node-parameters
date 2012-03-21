
path = require 'path'
start_stop = require '../start_stop'
###

HTTP server
===========

Register two commands, `http start` and `http stop`. The start command will 
search for "./server.js" and "./app.js" (and additionnaly their CoffeeScript 
alternatives) to run by `node`.The following properties may be provided as settings:

-   `config`   , Path to the configuration file. Required to launch redis.
-   `attach`   , Wether the HTTP process should be attached to the current process. If not defined, default to `false` (the server run as a daemon).
-   `pidfile`  , Path to the file storing the daemon process id. Defaults to `"/.node_shell/#{md5}.pid"`
-   `stdout`   , Writable stream or file path to redirect the server stdout.
-   `stderr`   , Writable stream or file path to redirect the server stderr.
-   `workspace`, Project directory used to resolve relative paths and search for "server" and "app" scripts.

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

###
module.exports = () ->
    settings = {}
    cmd = () ->
        if path.existsSync settings.workspace + '/server.js'
            'node ' + settings.workspace + '/server'
        else if path.existsSync settings.workspace + '/server.coffee'
            'coffee ' + settings.workspace + '/server.coffee'
        else if path.existsSync settings.workspace + '/app.js'
            'node ' + settings.workspace + '/app'
        else if path.existsSync settings.workspace + '/app.coffee'
            'coffee ' + settings.workspace + '/app.coffee'
        else
            throw new Error 'Failed to discover a "server.js" or "app.js" file'
    http = null
    # Register commands
    route = (req, res, next) ->
        app = req.shell
        # Caching
        return next() if app.tmp.http
        app.tmp.http = true
        # Workspace settings
        settings ?= {}
        settings.workspace ?= app.set 'workspace'
        throw new Error 'No workspace provided' if not settings.workspace
        # Messages
        settings.message_start ?= 'HTTP server successfully started'
        settings.message_stop ?= 'HTTP server successfully stopped'
        settings.cmd = cmd()
        app.cmd 'http start', 'Start HTTP server', (req, res, next) ->
            http = start_stop.start settings, (err, pid) ->
                return next err if err
                return res.cyan('HTTP server already started').ln() and res.prompt() unless pid
                res.cyan( 'HTTP server started' ).ln()
                res.prompt()
        app.cmd 'http stop', 'Stop HTTP server', (req, res, next) ->
            start_stop.stop settings, (err, success) ->
                if success
                then res.cyan('HTTP server successfully stoped').ln()
                else res.magenta('HTTP server was not started').ln()
                res.prompt()
        next()
    if arguments.length is 1
        settings = arguments[0]
        return route
    else
        route.apply null, arguments
