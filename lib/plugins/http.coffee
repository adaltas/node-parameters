
path = require 'path'
start_stop = require '../start_stop'

module.exports = (settings) ->
    # Validation
    throw new Error 'No shell provided' if not settings.shell
    shell = settings.shell
    # Default settings
    settings.workspace ?= shell.set 'workspace'
    throw new Error 'No workspace provided' if not settings.workspace
    settings.message_start ?= 'HTTP server successfully started'
    settings.message_stop ?= 'HTTP server successfully stopped'
    cmd = () ->
        if path.existsSync settings.workspace + '/server.js'
            cmd = 'node ' + settings.workspace + '/server'
        else if path.existsSync settings.workspace + '/server.coffee'
            cmd = 'coffee ' + settings.workspace + '/server.coffee'
        else if path.existsSync settings.workspace + '/app.js'
            cmd = 'node ' + settings.workspace + '/app'
        else if path.existsSync settings.workspace + '/app.coffee'
            cmd = 'coffee ' + settings.workspace + '/app.coffee'
        else
            throw new Error 'Failed to discover a "server.js" or "app.js" file'
    # Register commands
    http = null
    shell.cmd 'http start', 'Start HTTP server', (req, res, next) ->
        http = start_stop.start shell, settings, cmd(), (err) ->
            message = "HTTP server started"
            res.cyan( message ).ln()
            res.prompt()
    shell.cmd 'http stop', 'Stop HTTP server', (req, res, next) ->
        start_stop.stop shell, settings, http or cmd(), (err, success) ->
            if success
            then res.cyan('HTTP server successfully stoped').ln()
            else res.magenta('HTTP server was not started').ln()
            res.prompt()
