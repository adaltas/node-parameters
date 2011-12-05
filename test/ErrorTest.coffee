
shell = require '..'
assert = require 'assert'

module.exports =
    'Test # plugin # throw # print error': (next) ->
        stdout = new shell.NullStream
        app = shell
            workspace:  "#{__dirname}/PluginsHttp"
            command: 'test error'
            stdin: new shell.NullStream
            stdout: stdout
        app.configure ->
            app.use shell.http
            app.use shell.router shell: app
            app.use shell.error shell: app
        app.cmd 'test error', (req, res) ->
            assert.ok false
        out = ''
        stdout.on 'data', (data) ->
            out += data
        app.on 'quit', ->
            assert.ok /AssertionError/.test out
            next()
    'Test # plugin # throw # emit error': (next) ->
        app = shell
            workspace:  "#{__dirname}/PluginsHttp"
            command: 'test error'
            stdin: new shell.NullStream
            stdout: new shell.NullStream
        app.configure ->
            app.use shell.http
            app.use shell.router shell: app
            app.use shell.error shell: app
        app.cmd 'test error', (req, res) ->
            assert.ok false
        app.on 'error', (err) ->
            assert.eql err.name, 'AssertionError'
            next()
    'Test # no plugin # next # emit error': (next) ->
        app = shell
            workspace:  "#{__dirname}/PluginsHttp"
            command: 'test error'
            stdin: new shell.NullStream
            stdout: new shell.NullStream
        app.configure ->
            app.use shell.http
            app.use shell.router shell: app
        app.cmd 'test error', (req, res, n) ->
            n new Error 'My error'
        app.on 'error', (err) ->
            assert.eql err.message, 'My error'
            next()
    