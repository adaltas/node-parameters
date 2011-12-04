
assert = require 'assert'
shell = require 'shell'
http = require 'http'

module.exports = 
    'Http start/stop': (next) ->
        app = shell
            workspace:  "#{__dirname}/PluginsHtpp"
            command: null
            stdin: new shell.NullStream
            stdout: new shell.NullStream
        app.configure ->
            #app.use shell.history(shell: app)
            #app.use shell.completer(shell: app)
            app.use shell.http
            app.use shell.router shell: app
            #app.use shell.error shell: app
        app.run 'http start'
        setTimeout ->
            http.get(
                host: 'localhost'
                port: 8834
                path: '/ping'
            , (res) ->
                res.on 'data', (chunk) ->
                    assert.eql chunk.toString(), 'pong'
                    app.run 'http stop'
                    setTimeout ->
                        http.get(
                            host: 'localhost'
                            port: 8834
                            path: '/ping'
                        , (res) ->
                            assert.ok false
                        ).on 'error', (e) ->
                            assert.ok e instanceof Error
                            next()
                    , 300
            ).on 'error', (e) ->
                assert.ifError e
                next e
        , 300