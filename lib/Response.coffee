
styles = require './Styles'

module.exports = Response = (settings) ->
    this.shell = settings.shell
    styles.apply this, arguments

Response.prototype.__proto__ = styles.prototype

Response.prototype.prompt = ->
    this.shell.prompt()
