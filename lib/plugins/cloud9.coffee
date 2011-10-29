
start_stop = require '../start_stop'

module.exports = (settings = {}) ->
    cmd = () ->
        args = []
        args.push '-w'
        args.push settings.workspace
        # Arguments
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
        "cloud9 #{args.join(' ')}"
    cloud9 = null
    (req, res, next) ->
        app = req.shell
        # Caching
        return next() if app.tmp.cloud9
        app.tmp.cloud9 = true
        # Workspace
        settings.workspace ?= app.set 'workspace'
        return next(new Error 'No workspace provided') unless settings.workspace
        # Register commands
        app.cmd 'cloud9 start', 'Start Cloud9', (req, res, next) ->
            # Launch process
            cloud9 = start_stop.start app, settings, cmd(), (err, pid) ->
                return next err if err
                return res.cyan('Cloud9 already started').ln() unless pid
                ip = settings.ip or '127.0.0.1'
                port = settings.port or 3000
                message = "Cloud9 started http://#{ip}:#{port}"
                res.cyan( message ).ln()
                res.prompt()
        app.cmd 'cloud9 stop', 'Stop Cloud9', (req, res, next) ->
            start_stop.stop app, settings, cloud9 or cmd(), (err, success) ->
                if success
                then res.cyan('Cloud9 successfully stoped').ln()
                else res.magenta('Cloud9 was not started').ln()
                res.prompt()
        next()

