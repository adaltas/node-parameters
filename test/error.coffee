
should = require 'should'
shell = require '..'

describe 'plugin error', ->
    it 'should print a thrown error', (next) ->
        stdout = new shell.NullStream
        out = ''
        stdout.on 'data', (data) ->
            out += data
        app = shell
            command: 'test error'
            stdin: new shell.NullStream
            stdout: stdout
        app.configure ->
            app.use shell.router shell: app
            app.use shell.error shell: app
        app.cmd 'test error', (req, res) ->
            should.not.exist true
        app.on 'quit', ->
            out.should.match /AssertionError/ 
            next()
    it 'should emit thrown error', (next) ->
        app = shell
            command: 'test error'
            stdin: new shell.NullStream
            stdout: new shell.NullStream
        app.configure ->
            app.use shell.router shell: app
            app.use shell.error shell: app
        app.cmd 'test error', (req, res) ->
            should.not.exist true
        app.on 'error', (err) ->
            err.name.should.eql 'AssertionError'
            next()
    it 'router should graph error from previous route and emit it', (next) ->
        app = shell
            command: 'test error'
            stdin: new shell.NullStream
            stdout: new shell.NullStream
        app.configure ->
            app.use shell.router shell: app
        app.cmd 'test error', (req, res, n) ->
            n new Error 'My error'
        app.on 'error', (err) ->
            err.message.should.eql 'My error'
            next()
    