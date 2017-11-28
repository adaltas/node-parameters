
should = require 'should'
shell = if process.env.SHELL_COV then require '../lib-cov/Shell' else require '../src/Shell'
NullStream = if process.env.SHELL_COV then require '../lib-cov/NullStream' else require '../src/NullStream'
router = if process.env.SHELL_COV then require '../lib-cov/plugins/router' else require '../src/plugins/router'
styles = if process.env.SHELL_COV then require '../lib-cov/styles' else require '../src/Styles'

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
