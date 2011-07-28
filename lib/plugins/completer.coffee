
fs = require 'fs'
path = require 'path'

module.exports = (settings) ->
    # Validation
    throw new Error 'No shell provided' if not settings.shell
    shell = settings.shell
    # Plug completer to interface
    shell.interface.completer = (text) ->
        suggestions = []
        routes = shell.routes
        for route in routes
            command = route.command
            if command.substr 0, text.length is text
                suggestions.push command
        [suggestions, text]
    null
