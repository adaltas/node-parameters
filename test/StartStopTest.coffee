
fs = require 'fs'
path = require 'path'
assert = require 'assert'
start_stop = require '../lib/start_stop'

module.exports = 
    'Test daemon # start and stop': (next) ->
        cmd = "node #{__dirname}/StartStopTest/server.js"
        # Start the process
        start_stop.start cmd: cmd, (err, pid) ->
            assert.ifError err
            assert.ok typeof pid is 'number'
            # Check if process started
            start_stop.pidRunning pid, (err, exists) ->
                assert.ifError err
                assert.ok exists
                # Stop process
                start_stop.stop cmd:cmd, (err) ->
                    assert.ifError err
                    # Check if process stoped
                    start_stop.pidRunning pid, (err, exists) ->
                        assert.ifError err
                        assert.ok not exists
                        next()
    'Test daemon # stop inactive process': (next) ->
        cmd = "node #{__dirname}/StartStopTest/server.js"
        # Stop process
        start_stop.stop cmd:cmd, (err, stoped) ->
            assert.ifError err
            assert.ok not stoped
            next()
    'Test daemon # stop inactive process with pidfile': (next) ->
        cmd = "node #{__dirname}/StartStopTest/server.js"
        pidfile = "#{__dirname}/StartStopTest/pidfile"
        fs.writeFile pidfile, "1234567", (err) ->
            # Check process doesnt exists
            start_stop.pidRunning 1234567, (err, exists) ->
                assert.ifError err
                assert.ok not exists
                # Stop process
                start_stop.stop {cmd:cmd, pidfile: pidfile}, (err, stoped) ->
                    assert.ok err instanceof Error
                    # Pidfile shall be removed even if pid is invalid
                    path.exists pidfile, (exists) ->
                        assert.ok not exists
                        next()
    'Test attach': (next) ->
        cmd = "#{__dirname}/StartStopTest/server.js"
        # Start the process
        start_stop.start {cmd: cmd, attach: true}, (err, pid) ->
            assert.ifError err
            assert.ok typeof pid is 'number'
            # Check if process started
            start_stop.pidRunning pid, (err, exists) ->
                assert.ifError err
                assert.ok exists
                # Stop process
                start_stop.stop pid, (err) ->
                    assert.ifError err
                    # Check if process stoped
                    start_stop.pidRunning pid, (err, exists) ->
                        assert.ifError err
                        assert.ok not exists
                        next()
