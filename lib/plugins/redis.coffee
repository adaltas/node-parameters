
process = require '../process'

module.exports = (settings) ->
    # Validation
    throw new Error 'No shell provided' unless settings.shell
    throw new Error 'No path to the Redis configuration file' unless settings.config
    shell = settings.shell
    # Default settings
    settings.workspace ?= shell.project_dir
    # Register commands
    redis = null
    shell.cmd 'redis start', 'Start Redis', (req, res, next) ->
        # Launch process
        cmd = "redis-server #{settings.config}"
        redis = process.start shell, settings, cmd, (err) ->
            ip = settings.ip or '127.0.0.1'
            port = settings.port or 3000
            message = "Redis started"
            res.cyan( message ).ln()
            res.prompt()
    shell.cmd 'redis stop', 'Stop Redis', (req, res, next) ->
        process.stop settings, redis, (err, success) ->
            if success
            then res.cyan('Redis successfully stoped').ln()
            else res.magenta('Redis was not started').ln()
            res.prompt()
