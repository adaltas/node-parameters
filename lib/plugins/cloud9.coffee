
fs = require('fs')
path = require('path')
spawn = require('child_process').spawn

module.exports = (settings = {}) ->
    # Validation
    throw new Error 'No shell provided' if not settings.shell
    shell = settings.shell
    # Default settings
    settings.workspace ?= shell.project_dir
    throw new Error 'No workspace provided' if not settings.workspace
    settings.stdout ?= '/dev/null'
    settings.stderr ?= '/dev/null'
    cloud9 = null
    # Kill Cloud9 on exit if started in attached mode
    shell.on 'exit', ->
        cloud9.kill() if shell.isShell and not settings.detach and cloud9
    # Register commands
    shell.cmd 'cloud9 start', 'Start Cloud9', (req, res, next) ->
        args = []
        detached = not shell.isShell or settings.detach
        args.push '-w'
        args.push settings.workspace
        if settings.config
            args.push '-c'
            args.push settings.config
        if settings.group
            args.push '-g'
            args.push settings.group
        if settings.user
            args.push '-u'
            args.push settings.user
        if settings.action
            args.push '-a'
            args.push settings.action
        if settings.ip
            args.push '-l'
            args.push settings.ip
        if settings.port
            args.push '-p'
            args.push settings.port
        ###
        if detached
            args.push '</dev/null'
            args.push '>' + settings.stdout
            args.push '2>' + settings.stderr
        ###
        cloud9 = spawn 'cloud9', args
        if settings.stdout
            cloud9.stdout.pipe(
                if   typeof settings.stdout is 'string'
                then fs.createWriteStream settings.stdout
                else settings.stdout
            )
        if settings.stderr
            cloud9.stderr.pipe(
                if   typeof settings.stderr is 'string'
                then fs.createWriteStream settings.stderr
                else settings.stderr
            )
        if detached
            pidfile = settings.pidfile or '/tmp/cloud9.pid'
            fs.writeFileSync pidfile, '' + cloud9.pid
        # Give a chance to cloud9 to startup
        # and open a browser window in command mode
        setTimeout ->
            if cloud9
                ip = settings.ip or '127.0.0.1'
                port = settings.port or 3000
                message = "Cloud9 started http://#{ip}:#{port}"
                res.cyan( message ).ln()
            res.prompt()
        , 600
    shell.cmd 'cloud9 stop', 'Stop Cloud9', (req, res, next) ->
        if not shell.isShell or settings.detach
            pidfile = settings.pidfile or '/tmp/cloud9.pid'
            pid = fs.readFileSync pidfile
            cloud9 = spawn 'kill', [pid]
            cloud9.on 'exit', (code) ->
                if   code is 0
                then res.cyan('Cloud9 successfully stoped').ln()
                else res.red('Error while stoping Cloud9').ln()
                fs.unlinkSync pidfile
                res.prompt()
        else if cloud9
            cloud9.on 'exit', (code) ->
                cloud9 = null
                res.cyan('Cloud9 successfully stopped').ln()
                res.prompt()
            cloud9.kill()
        else
            res.red('Cloud9 was not started').ln()
            res.prompt()

