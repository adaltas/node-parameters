
crypto = require 'crypto'
child = require 'child_process'
fs = require 'fs'
path = require 'path'

start_stop = module.exports = {}

md5 = (cmd) ->
    crypto.createHash('md5').update(cmd).digest('hex')

getPidfile = (settings, callback) ->
    return callback null, settings.pidfile if settings.pidfile
    dir = path.resolve process.env['HOME'], '.node_shell'
    file = md5 settings.cmd
    createDir = not path.existsSync dir
    fs.mkdirSync dir, 0700 if createDir
    settings.pidfile = "#{dir}/#{file}.pid"
    callback null

###
*   `cmd`       Command to run
*   `daemon`    Daemonize the child process
*   `pidfile`   Path to the file storing the child pid
*   `stdout`    Path to the file where stdout is redirected
*   `stderr`    Path to the file where stderr is redirected
###
start_stop.start = (settings, callback) ->
    unless settings.attach
        cmdStdout =
            if typeof settings.stdout is 'string' 
            then settings.stdout else '/dev/null'
        cmdStderr =
            if typeof settings.stderr is 'string'
            then settings.stderr else '/dev/null'
        # Get the pid if it can read it from the pidfile
        pidRead = (callback) ->
            path.exists settings.pidfile, (exists) ->
                return callback null, null unless exists
                fs.readFile settings.pidfile, (err, pid) ->
                    return callback err if err
                    pid = parseInt pid, 10
                    callback null, pid
        # Start the process
        start = (callback) ->
            pipe = "</dev/null >#{cmdStdout} 2>#{cmdStdout}"
            info = 'echo $? $!'
            cmd = "#{settings.cmd} #{pipe} & #{info}"
            child.exec cmd, (err, stdout, stderr) ->
                [code, pid] = stdout.split(' ')
                code = parseInt code, 10
                pid = parseInt pid, 10
                if code isnt 0
                    msg = "Process exit with code #{code}"
                    return callback new Error msg
                fs.writeFile settings.pidfile, '' + pid, (err) ->
                    callback null, pid
        # Do the all job
        getPidfile settings, (err) ->
            pidRead (err, pid) ->
                return start callback unless pid
                start_stop.pidRunning pid, (err, pid) ->
                    callback new Error "Pid #{pid} already running" if pid
                    start callback
    else # Kill child on exit if started in attached mode
        #shell.on 'exit', -> child.kill()
        c = child.exec settings.cmd
        if typeof settings.stdout is 'string'
            stdout =  fs.createWriteStream settings.stdout
        else if settings.stdout isnt null and typeof settings.stdout is 'object'
            stdout = settings.stdout
        else
            stdout = null
        if typeof settings.stderr is 'string'
            stdout =  fs.createWriteStream settings.stderr
        else if settings.stderr isnt null and typeof settings.stderr is 'object'
            stderr = settings.stderr
        else
            stderr = null
        #process.stdout.pipe stdout if stdout
        #process.stderr.pipe stderr if stderr
        process.nextTick ->
            # Block the command if not in shell and process is attached
            #return if not shell.isShell and settings.daemon
            settings.pid = c.pid
            callback null, c.pid

start_stop.stop = (settings, callback) ->
    if typeof settings is 'string' or typeof settings is 'number'
        settings = {pid: parseInt(settings, 10), attach: true}
    kill = (pid, callback) ->
        cmds = """
        for i in `ps -ef | awk '$3 == '#{pid}' { print $2 }'`
        do
            kill $i
        done
        kill #{pid}
        """
        child.exec cmds, (err, stdout, stderr) ->
            callback err
    unless settings.attach
        getPidfile settings, (err) ->
            #return callback null, false unless path.existsSync pidfile
            path.exists settings.pidfile, (exists) ->
                return callback null, false unless exists
                pid = fs.readFileSync settings.pidfile, 'ascii'
                pid = pid.trim()
                return fs.unlink settings.pidfile, (err) ->
                    return callback err if err
                    kill pid, (err, stdout, stderr) ->
                        return callback err if err
                        callback null, true
    else
        kill settings.pid, (err) ->
            return callback new Error "Unexpected exit code #{err.code}" if err
            callback null, true
###
Get the pid if it match a live process
###
start_stop.pidRunning = (pid, callback) ->
    child.exec "ps -ef | grep #{pid} | grep -v grep", (err, stdout, stderr) ->
        return callback err if err and err.code isnt 1
        callback null, not err
