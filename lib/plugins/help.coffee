
utils = require '../utils'

module.exports = (settings) ->
    # Validation
    throw new Error 'No shell provided' if not settings.shell
    shell = settings.shell
    # Register function
    shell.help = (req, res, next) ->
        res.cyan 'Available commands:'
        res.ln()
        routes = shell.routes
        for route in routes
            text = utils.pad route.command, 20
            res
            .cyan(text)
            .white(route.description)
            .ln() if route.description
        res.prompt()
    # Register commands
    shell.cmd 'help', 'Show this message', shell.help.bind shell
    shell.cmd '', shell.help.bind shell
    # Print introduction message
    if shell.isShell and settings.introduction
        text =
            if   typeof settings.introduction is 'string'
            then settings.introduction
            else 'Type "help" or press enter for a list of commands'
        shell.styles.println text
