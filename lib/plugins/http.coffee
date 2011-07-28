
fs = require 'fs'
path = require 'path'
exec = require('child_process').exec

module.exports = (settings) ->
    # Validation
    throw new Error 'No shell provided' if not settings.shell
    shell = settings.shell
    # Default settings
    settings.workspace ?= shell.project_dir;
    throw new Error 'No workspace provided' if not settings.workspace
    settings.message_start ?= 'HTTP server successfully started'
    settings.message_stop ?= 'HTTP server successfully stopped'
    # Register commands
    http = null
    shell.on 'exit', () ->
        http.kill() if shell.isShell and not settings.detach and http
    shell.cmd 'http start', 'Start HTTP server', (req, res, next) ->
        args = []
        detached = not shell.isShell or settings.detach
        pipeStdout = settings.stdout and not detached
        pipeStderr = settings.stderr and not detached
        args.push '-w'
        args.push settings.workspace
        if not pipeStdout
            args.push '>'
            args.push settings.stdout
        if not pipeStderr
            args.push '2>'
            args.push settings.stderr
        if path.existsSync settings.workspace + '/server.js'
            args.unshift 'node ' + settings.workspace + '/server'
        else if path.existsSync settings.workspace + '/app.js'
            args.unshift 'node ' + settings.workspace + '/app'
        else
            next new Error('Failed to find appropriate "server.js" or "app.js" file')
        args = args.join ' '
        http = exec args
        done = false
        interval = setInterval ->
            clearInterval interval if done
        , 100
        http.on 'exit', (code) ->
            if   code is 0
            then res.cyan settings.message_start
            else res.red 'Error while starting HTTP server'
            fs.unlinkSync pidfile if path.existsSync pidfile
            res.prompt()
            done = true
        if pipeStdout
            http.stdout.pipe(
                if   typeof settings.stdout is 'string'
                then fs.createWriteStream settings.stdout
                else settings.stdout
            )
        if pipeStderr
            http.stderr.pipe(
                if   typeof settings.stderr is 'string'
                else fs.createWriteStream settings.stderr
                then settings.stderr
            )
        if detached
            pidfile = settings.pidfile or '/tmp/http.pid'
            fs.writeFileSync pidfile, '' + http.pid
    shell.cmd 'http stop', 'Stop HTTP server', (req, res, next) ->
        if not shell.isShell or settings.detach
            pidfile = settings.pidfile or '/tmp/http.pid'
            pid = fs.readFileSync pidfile
            cmds = []
            cmds.push "for i in `ps -ef| awk '$3 == '#{pid}' { print $2 }'` ; do kill $i ; done"
            cmds.push "kill #{pid}"
            cmds = cmds.join ' && '
            http = exec(cmds)
            http.on 'exit', (code) ->
                if   code is 0
                then res.cyan settings.message_stop
                else res.red 'Error while stoping HTTP server'
                fs.unlinkSync pidfile
                res.prompt()
        else if http
            http.on 'exit', (code) ->
                http = null
                res.cyan settings.message_stop
                res.prompt()
            http.kill()
        else
            console.log 'this should not appear'
            res.prompt()
