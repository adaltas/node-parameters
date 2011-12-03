
shell = require '..'
assert = require 'assert'

module.exports = 
    'Question # req # string': (next) ->
        stdin = new shell.NullStream
        stdout = new shell.NullStream
        stdout.on 'data', (data) ->
            return unless data.trim()
            assert.eql data, 'My question: '
            stdin.emit 'data', 'My answer'
        app = shell
            workspace:  "#{__dirname}/plugins_http"
            command: 'test string'
            stdin: stdin
            stdout: stdout
        app.configure ->
            app.use shell.router shell: app
        app.cmd 'test string', (req, res) ->
            req.question 'My question:', (value) ->
                assert.eql value, 'My answer'
                next()
    'Question # req # array of objects': (next) ->
        expects = ['Question 1 ', 'Question 2 [v 2] ']
        stdin = new shell.NullStream
        stdout = new shell.NullStream
        stdout.on 'data', (data) ->
            return unless data.trim()
            assert.eql data, expects.shift()
            stdin.emit 'data', "Value #{2 - expects.length}"
        app = shell
            workspace:  "#{__dirname}/plugins_http"
            command: 'test array'
            stdin: stdin
            stdout: stdout
        app.configure ->
            app.use shell.router shell: app
        app.cmd 'test array', (req, res) ->
            req.question [
                name: 'Question 1'
            ,
                name: 'Question 2'
                value: 'v 2'
            ], (values) ->
                assert.eql values, 
                    'Question 1': 'Value 1'
                    'Question 2': 'Value 2'
                next()
    'Question # req # object': (next) ->
        expects = ['Question 1 ', 'Question 2 [v 2] ', 'Question 3 [v 3] ']
        stdin = new shell.NullStream
        stdout = new shell.NullStream
        stdout.on 'data', (data) ->
            return unless data.trim()
            assert.eql data, expects.shift()
            stdin.emit 'data', "Value #{3 - expects.length}"
        app = shell
            workspace:  "#{__dirname}/plugins_http"
            command: 'test object'
            stdin: stdin
            stdout: stdout
        app.configure ->
            app.use shell.router shell: app
        app.cmd 'test object', (req, res) ->
            req.question
                'Question 1': null
                'Question 2': 'v 2'
                'Question 3': { value: 'v 3'}
            , (values) ->
                assert.eql values, 
                    'Question 1': 'Value 1'
                    'Question 2': 'Value 2'
                    'Question 3': 'Value 3'
                next()
