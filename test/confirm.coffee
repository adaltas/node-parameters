
should = require 'should'
shell = require '../src/Shell'
NullStream = require '../src/NullStream'
router = require '../src/plugins/router'
styles = require '../src/Styles'

describe 'req confirm', ->
  it 'should provide a boolean', (next) ->
    stdin = new NullStream
    stdout = new NullStream
    stdout.on 'data', (data) ->
      return unless data.trim()
      styles.unstyle(data).should.eql 'Do u confirm? [Yn] '
      @answer = not @answer
      stdin.emit 'data', new Buffer(if @answer then 'y\n' else 'N\n')
    app = shell
      workspace:  "#{__dirname}/plugins_http"
      command: 'test string'
      stdin: stdin
      stdout: stdout
    app.configure ->
      app.use router shell: app
    app.cmd 'test string', (req, res) ->
      req.confirm 'Do u confirm?', (value) ->
        value.should.eql true
        req.confirm 'Do u confirm?', (value) ->
          value.should.eql false
          next()
