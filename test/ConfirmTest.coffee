
shell = require '..'
assert = require 'assert'
styles = require '../lib/styles'

module.exports = 
    'Confirm # yes and no': (next) ->
        stdin = new shell.NullStream
        stdout = new shell.NullStream
        stdout.on 'data', (data) ->
            return unless data.trim()
            assert.eql styles.unstyle(data), 'Do u confirm? [Yn] '
            @answer = !@answer
            stdin.emit 'data', if @answer then 'y' else 'N'
        app = shell
            workspace:  "#{__dirname}/plugins_http"
            command: 'test string'
            stdin: stdin
            stdout: stdout
        app.configure ->
            app.use shell.router shell: app
        app.cmd 'test string', (req, res) ->
            req.confirm 'Do u confirm?', (value) ->
                assert.eql value, true
                req.confirm 'Do u confirm?', (value) ->
                    assert.eql value, false
                    next()
