
fs = require 'fs'
path = require 'path'
exists = fs.exists or path.exists
should = require 'should'
start_stop = require '../lib/start_stop'

describe 'StartStop', ->
    it 'Test daemon # start and stop', (next) ->
        cmd = "node #{__dirname}/start_stop/server.js"
        # Start the process
        start_stop.start cmd: cmd, (err, pid) ->
            should.not.exist err
            pid.should.be.a 'number'
            # Check if process started
            start_stop.running pid, (err, running) ->
                should.not.exist err
                running.should.be.true
                # Stop process
                start_stop.stop cmd: cmd, (err) ->
                    should.not.exist err
                    # Check if process stoped
                    start_stop.running pid, (err, running) ->
                        should.not.exist err
                        running.should.be.false
                        next()
    it 'Test daemon # stop inactive process', (next) ->
        cmd = "node #{__dirname}/start_stop/server.js"
        # Stop process
        start_stop.stop cmd:cmd, (err, stoped) ->
            should.not.exist err
            stoped.should.be.false
            next()
    it 'Test daemon # stop inactive process with pidfile # relax', (next) ->
        cmd = "node #{__dirname}/start_stop/server.js"
        pidfile = "#{__dirname}/start_stop/pidfile"
        fs.writeFile pidfile, "1234567", (err) ->
            # Check process doesnt exists
            start_stop.running 1234567, (err, running) ->
                should.not.exist err
                running.should.be.false
                # Stop process
                start_stop.stop {cmd:cmd, pidfile: pidfile}, (err, stoped) ->
                    should.not.exist err
                    stoped.should.be.false
                    # Pidfile shall be removed even if pid is invalid
                    exists pidfile, (running) ->
                        running.should.be.false
                        next()
    it 'Test daemon # stop inactive process with pidfile # strict', (next) ->
        cmd = "node #{__dirname}/start_stop/server.js"
        pidfile = "#{__dirname}/start_stop/pidfile"
        fs.writeFile pidfile, "1234567", (err) ->
            # Check process doesnt exists
            start_stop.running 1234567, (err, running) ->
                should.not.exist err
                running.should.be.false
                # Stop process
                start_stop.stop {cmd:cmd, pidfile: pidfile, strict: true}, (err, stoped) ->
                    err.should.be.an.instanceof Error
                    # Pidfile shall be removed even if pid is invalid
                    exists pidfile, (running) ->
                        running.should.be.false
                        next()
    it 'should throw an error if pidfile is not in a existing directory', (next) ->
        cmd = "node #{__dirname}/start_stop/server.js"
        pidfile = "#{__dirname}/doesnotexist/pidfile"
        start_stop.start cmd:cmd, pidfile: pidfile, (err, stoped) ->
            err.should.be.an.instanceof Error
            err.message.should.eql 'Pid directory does not exist'
            next()
    it 'Test attach', (next) ->
        cmd = "node #{__dirname}/start_stop/server.js"
        # Start the process
        start_stop.start {cmd: cmd, attach: true}, (err, pid) ->
            should.not.exist err
            pid.should.be.a 'number'
            # Check if process started
            start_stop.running pid, (err, running) ->
                should.not.exist err
                running.should.be.true
                # Stop process
                start_stop.stop pid, (err) ->
                    should.not.exist err
                    # Check if process stoped
                    start_stop.running pid, (err, running) ->
                        should.not.exist err
                        running.should.be.false
                        next()

