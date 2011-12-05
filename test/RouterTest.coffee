
shell = require '..'
assert = require 'assert'

module.exports = 
    'Test simple': (next) ->
        app = shell
            workspace:  "#{__dirname}/PluginsHttp"
            command: 'test simple'
            stdin: new shell.NullStream
            stdout: new shell.NullStream
        app.configure ->
            app.use shell.http
            app.use shell.router shell: app
        app.cmd 'test simple', (req, res) ->
            next()
    'Test param # string': (next) ->
        app = shell
            workspace:  "#{__dirname}/PluginsHttp"
            command: 'test my_value'
            stdin: new shell.NullStream
            stdout: new shell.NullStream
        app.configure ->
            app.use shell.http
            app.use shell.router shell: app
        app.cmd 'test :my_param', (req, res) ->
            assert.eql req.params.my_param, 'my_value'
            next()
    'Test param # special char': (next) ->
        app = shell
            workspace:  "#{__dirname}/PluginsHttp"
            command: 'test 12.32/abc'
            stdin: new shell.NullStream
            stdout: new shell.NullStream
        app.configure ->
            app.use shell.http
            app.use shell.router shell: app
        app.cmd 'test :my_param', (req, res) ->
            assert.eql req.params.my_param, '12.32/abc'
            next()
    'Test # param with restriction # ok': (next) ->
        app = shell
            workspace:  "#{__dirname}/PluginsHttp"
            command: 'test 9034'
            stdin: new shell.NullStream
            stdout: new shell.NullStream
        app.configure ->
            app.use shell.http
            app.use shell.router shell: app
        app.cmd 'test :my_param([0-9]+)', (req, res) ->
            assert.eql req.params.my_param, '9034'
            next()
        app.cmd 'test :my_param', (req, res) ->
            assert.ok false
    'Test # param with restriction # error': (next) ->
        app = shell
            workspace:  "#{__dirname}/PluginsHttp"
            command: 'test abc'
            stdin: new shell.NullStream
            stdout: new shell.NullStream
        app.configure ->
            app.use shell.http
            app.use shell.router shell: app
        app.cmd 'test :my_param([0-9]+)', (req, res) ->
            assert.ok false
        app.cmd 'test :my_param', (req, res) ->
            next()
        
