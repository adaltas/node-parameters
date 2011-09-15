
styles = require './Styles'
utils = require './utils'

module.exports = class Response extends styles
    constructor: (settings) ->
        @shell = settings.shell
        super settings
    pad: utils.pad
    prompt: ->
        @shell.prompt()
