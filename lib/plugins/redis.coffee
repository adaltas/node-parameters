
fs = require 'fs'
path = require 'path'
spawn = require('child_process').spawn

module.exports = (settings) ->
    # Validation
    throw new Error 'No shell provided' if not settings.shell
    throw new Error 'No path to the Redis configuration file' if not settings.config
    shell = settings.shell
    # Default settings
    settings.workspace ?= shell.project_dir
    # Register commands
    redis = null
    shell.on 'exit', ->
        redis.kill() if shell.isShell and not settings.detach and redis
    shell.cmd 'redis start', 'Start Redis', (req, res, next) ->
        args = []
        args.push settings.config
        redis = spawn 'redis-server', args
        if settings.stdout
            redis.stdout.pipe(
                if   typeof settings.stdout is 'string'
                then fs.createWriteStream settings.stdout
                else settings.stdout
            )
        if settings.stderr
            redis.stderr.pipe(
                if   typeof settings.stderr is 'string'
                then fs.createWriteStream settings.stderr
                else settings.stderr
            )
        if not shell.isShell or settings.detach
            pidfile = settings.pidfile or '/tmp/redis.pid'
            fs.writeFileSync pidfile, '' + redis.pid
        # Give a chance to redis to startup
        setTimeout ->
            res.cyan('Redis started').ln() if redis
            res.prompt()
        , 500
    shell.cmd 'redis stop', 'Stop Redis', (req, res, next) ->
        if not shell.isShell or settings.detach
            pidfile = settings.pidfile or '/tmp/redis.pid'
            if not path.existsSync pidfile
                return res.red('Failed to stop redis: no pid file').prompt()
            pid = fs.readFileSync pidfile
            redis = spawn 'kill', [pid]
            redis.on 'exit', (code) ->
                if   code is 0
                then res.cyan 'Redis successfully stoped'
                else res.red 'Error while stoping Redis'
                fs.unlinkSync pidfile
                res.prompt()
        else if redis
            redis.on 'exit', (code) ->
                redis = null
                res.cyan 'Redis successfully stopped'
                res.prompt()
            redis.kill()
        else
            res.prompt()
