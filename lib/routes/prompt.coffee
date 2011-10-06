
module.exports = (req, res, next) ->
    if arguments.length is 1
        message = arguments[0]
        return (req, res, next) ->
            res.white message
            res.ln()
            res.prompt()
    else
        res.prompt()