
module.exports = (message) ->
    (req, res, next) ->
        req.confirm message, true, (confirmed) ->
            return res.prompt() unless confirmed
            next()
    
