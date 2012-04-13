
should = require 'should'
shell = require '..'

describe 'Shell', ->
    ###
    Note
    version 0.4.x didn't hold currentprocess if `process.stdin`
    was referenced, so `app.quit()` was not required
    ###
    it 'should construct with new call', ->
        app = new shell
            command: ''
            stdin: new shell.NullStream
            stdout: new shell.NullStream
        app.should.be.an.instanceof shell
        app.quit()
    it 'should construct with function call', ->
        app = shell
            command: ''
            stdin: new shell.NullStream
            stdout: new shell.NullStream
        app.should.be.an.instanceof shell
        app.quit()