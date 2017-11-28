
styles = require './Styles'
pad = require 'pad'

module.exports = class Response extends styles
  constructor: (settings) ->
    super settings
    @shell = settings.shell
  pad: pad
  prompt: ->
    @shell.prompt()
    
