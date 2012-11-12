
should = require 'should'
http = require 'http'
shell = require '..'

describe 'Plugin HTTP', ->
  it 'should start and stop an HTTP server in attach mode', (next) ->
    app = shell
      workspace:  "#{__dirname}/plugin_http"
      command: null
      stdin: new shell.NullStream
      stdout: new shell.NullStream
    app.configure ->
      app.use shell.http detached: false
      app.use shell.router shell: app
    app.run 'http start'
    setTimeout ->
      http.get(
        host: 'localhost'
        port: 8834
        path: '/ping'
      , (res) ->
        res.on 'data', (chunk) ->
          chunk.toString().should.eql 'pong'
          app.run 'http stop'
          setTimeout ->
            http.get(
              host: 'localhost'
              port: 8834
              path: '/ping'
            , (res) ->
              should.not.exist false
            ).on 'error', (e) ->
              e.should.be.an.instanceof Error
              next()
          , 300
      ).on 'error', (e) ->
        should.not.exist e
        next e
    , 300