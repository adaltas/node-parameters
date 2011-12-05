
start_stop = require '../start_stop'

module.exports = () ->
    settings = {}
    # Register commands
    redis = null
    route = (req, res, next) ->
        app = req.shell
        # Caching
        return next() if app.tmp.redis
        app.tmp.redis = true
        # Default settings
        settings.workspace ?= app.set 'workspace'
        settings.config ?= ''
        settings.cmd = "redis-server #{settings.config}"
        app.cmd 'redis start', 'Start Redis', (req, res, next) ->
            # Launch process
            redis = start_stop.start settings, (err, pid) ->
                return next err if err
                unless pid
                    res.cyan('Redis already started').ln()
                    return res.prompt() 
                res.cyan('Redis started').ln()
                res.prompt()
        app.cmd 'redis stop', 'Stop Redis', (req, res, next) ->
            start_stop.stop settings, (err, success) ->
                if success
                then res.cyan('Redis successfully stoped').ln()
                else res.magenta('Redis was not started').ln()
                res.prompt()
        next()
    if arguments.length is 1
        settings = arguments[0]
        return route
    else
        route.apply null, arguments
