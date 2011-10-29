
module.exports = (timeout) ->
    (req, res, next) ->
        setTimeout timeout, next
