
module.exports = (settings) ->
    # Validation
    throw new Error 'No shell provided' if not settings.shell
    shell = settings.shell
    (err, req, res, next) ->
        res.red(err.message).ln()
        res.red(err.stack).ln()
        res.prompt()