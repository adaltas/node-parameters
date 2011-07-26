
fs = require('fs')
path = require('path')
exec = require('child_process').exec

module.exports = (settings) ->
    # Validation
    throw new Error 'No shell provided' if not settings.shell
    shell = settings.shell
    # Default settings
    settings.workspace ?= shell.project_dir
    throw new Error('No workspace provided') if not settings.workspace
    settings.stdout ?= '/dev/null'
    settings.stderr ?= '/dev/null'
    # Register commands
    cloud9 = null
    shell.on 'exit', ->
        cloud9.kill() if shell.isShell and not settings.detach and cloud9
    shell.cmd 'cloud9 start', 'Start Cloud9', (req, res, next) ->
        args = [];
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
        if detached
            args.push '>'
            args.push settings.stdout or '/dev/null'
        if detached
            args.push '2>'
            args.push settings.stderr or '/dev/null'
        args.unshift 'cloud9'
        args = args.join ' '
        cloud9 = exec args
        if detached
            pidfile = settings.pidfile or '/tmp/cloud9.pid'
            fs.writeFileSync pidfile, '' + cloud9.pid
        else
            cloud9.stdout.pipe(
                if   typeof settings.stdout is 'string'
                then fs.createWriteStream settings.stdout
                else settings.stdout
            )
            cloud9.stderr.pipe(
                if   typeof settings.stderr is 'string'
                then fs.createWriteStream settings.stderr
                else settings.stderr
            )
        # Give a chance to cloud9 to startup
        # and open a browser window in command mode
        setTimeout ->
            if cloud9
                ip = settings.ip or '127.0.0.1'
                port = settings.port or 3000
                message = "Cloud9 started http://#{ ip }:#{ port }"
                res.cyan( message ).ln()
            res.prompt()
        , 500
    shell.cmd 'cloud9 stop', 'Stop Cloud9', (req, res, next) ->
        if not shell.isShell or settings.detach or not cloud9
            pidfile = settings.pidfile or '/tmp/cloud9.pid'
            pid = fs.readFileSync pidfile
            cmds = []
            cmds.push "for i in `ps -ef| awk '$3 == '#{ pid }' { print $2 }'` ; do kill $i ; done"
            cmds.push "kill #{ pid }"
            cloud9 = exec cmds.join(' && ')
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
            console.log 'this should not appear'
            res.prompt()

