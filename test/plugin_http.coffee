
should = require 'should'
client = require 'http'
shell = require '../lib/Shell'
NullStream = require '../lib/NullStream'
router = require '../lib/plugins/router'
http = require '../lib/plugins/http'

describe 'Plugin HTTP', ->
  it 'should start and stop an HTTP server in attach mode', (next) ->
    app = shell
      workspace:  "#{__dirname}/plugin_http"
      command: null
      stdin: new NullStream
      stdout: new NullStream
    app.configure ->
      app.use http detached: false
      app.use router shell: app
    app.run 'http start'
    setTimeout ->
      client.get(
        host: 'localhost'
        port: 8834
        path: '/ping'
      , (res) ->
        res.on 'data', (chunk) ->
          chunk.toString().should.eql 'pong'
          app.run 'http stop'
          setTimeout ->
            client.get(
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
