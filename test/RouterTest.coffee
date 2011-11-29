
shell = require '..'
assert = require 'assert'

module.exports = 
    'Test simple': (next) ->
        app = shell
            workspace:  "#{__dirname}/plugins_http"
            command: 'test simple'
            stdin: new shell.NullStream
            stdout: new shell.NullStream
        app.configure ->
            app.use shell.http
            app.use shell.router shell: app
        app.cmd 'test simple', (req, res) ->
            next()
    'Test param': (next) ->
        app = shell
            workspace:  "#{__dirname}/plugins_http"
            command: 'test my_value'
            stdin: new shell.NullStream
            stdout: new shell.NullStream
        app.configure ->
            app.use shell.http
            app.use shell.router shell: app
        app.cmd 'test :my_param', (req, res) ->
            assert.eql req.params.my_param, 'my_value'
            next()
        
