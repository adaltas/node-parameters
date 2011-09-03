
process = require '../process'

module.exports = (settings = {}) ->
    # Validation
    throw new Error 'No shell provided' if not settings.shell
    shell = settings.shell
    # Default settings
    settings.workspace ?= shell.project_dir
    throw new Error 'No workspace provided' if not settings.workspace
    cloud9 = null
    # Register commands
    shell.cmd 'cloud9 start', 'Start Cloud9', (req, res, next) ->
        args = []
        detached = not shell.isShell or settings.detach
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
        cmd = 'cloud9 ' + args.join(' ')
        # Launch process
        cloud9 = process.start shell, settings, cmd, (err) ->
            ip = settings.ip or '127.0.0.1'
            port = settings.port or 3000
            message = "Cloud9 started http://#{ip}:#{port}"
            res.cyan( message ).ln()
            res.prompt()
    shell.cmd 'cloud9 stop', 'Stop Cloud9', (req, res, next) ->
        process.stop settings, cloud9, (err, success) ->
            if success
            then res.cyan('Cloud9 successfully stoped').ln()
            else res.magenta('Cloud9 was not started').ln()
            res.prompt()

