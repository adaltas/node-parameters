
start_stop = require '../start_stop'

module.exports = (settings) ->
    # Validation
    throw new Error 'No shell provided' unless settings.shell
    throw new Error 'No path to the Redis configuration file' unless settings.config
    shell = settings.shell
    # Default settings
    settings.workspace ?= shell.set 'workspace'
    cmd = () ->
        "redis-server #{settings.config}"
    # Register commands
    redis = null
    shell.cmd 'redis start', 'Start Redis', (req, res, next) ->
        # Launch process
        redis = start_stop.start shell, settings, cmd(), (err, pid) ->
            return next err if err
            return res.cyan('Redis already started').ln() unless pid
            res.cyan('Redis started').ln()
            res.prompt()
    shell.cmd 'redis stop', 'Stop Redis', (req, res, next) ->
        start_stop.stop shell, settings, redis or cmd(), (err, success) ->
            if success
            then res.cyan('Redis successfully stoped').ln()
            else res.magenta('Redis was not started').ln()
            res.prompt()
