
crypto = require 'crypto'
exec = require('child_process').exec
fs = require 'fs'
path = require 'path'

md5 = (cmd) ->
    crypto.createHash('md5').update(cmd).digest('hex')

getPidfile = (cmd) ->
    dir = process.env['HOME'] + '/.node_shell'
    file = md5 cmd
    createDir = not path.existsSync process.env['HOME'] + '/.node_shell'
    fs.mkdirSync dir, 0700 if createDir
    "#{dir}/#{file}.pid"

module.exports.start = (shell, settings, cmd, callback) ->
    detach = settings.detach ? not shell.isShell
    #if detach and not settings.pidfile
        #throw new Error 'Property settings.pidfile required in detached mode'
    if detach
        cmdStdout = if typeof settings.stdout is 'string' then settings.stdout else '/dev/null'
        cmdStderr = if typeof settings.stderr is 'string' then settings.stderr else '/dev/null'
        pidfile = settings.pidfile or getPidfile cmd
        # return the pid if it match a live process
        pidExists = (pid, callback) ->
            exec "ps -ef | grep #{pid} | grep -v grep", (err, stdout, stderr) ->
                return callback err if err and err.code isnt 1
                return callback null, null if err
                callback null, pid
                #callback err
        # return the pid if it can read it from the pidfile
        pidRead = (callback) ->
            path.exists pidfile, (exists) ->
                return callback null, null unless exists
                fs.readFile pidfile, (err, pid) ->
                    return callback err if err
                    pid = parseInt pid, 10
                    callback null, pid
        start = () ->
            pipe = "</dev/null >#{cmdStdout} 2>#{cmdStdout}"
            info = 'echo $? $!'
            child = exec "#{cmd} #{pipe} & #{info}", (err, stdout, stderr) ->
                [code, pid] = stdout.split(' ')
                return callback new Error "Process exit with code #{code}" if code isnt '0'
                fs.writeFileSync pidfile, '' + pid
                callback null, pid
        pidRead (err, pid) ->
            return start() unless pid
            pidExists pid, (err, pid) ->
                return start() unless pid
                callback null, false
    else # Kill child on exit if started in attached mode
        shell.on 'exit', -> child.kill()
        child = exec cmd
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
        child.stderr.pipe stdout if stdout
        child.stderr.pipe stderr if stderr
        process.nextTick ->
            # Block the command if not in shell and process is attached
            return if not shell.isShell and settings.detach is false
            callback null, child.pid
        child


module.exports.stop = (shell, settings, cmdOrChild, callback) ->
    detach = settings.detach ? not shell.isShell
    if detach
        pidfile = settings.pidfile or getPidfile cmdOrChild
        #return callback null, false unless path.existsSync pidfile
        path.exists pidfile, (exists) ->
            return callback null, false unless exists
            pid = fs.readFileSync pidfile, 'ascii'
            pid = pid.trim()
            cmds = []
            cmds.push "for i in `ps -ef| awk '$3 == '#{pid}' { print $2 }'` ; do kill $i ; done"
            cmds.push "kill #{pid}"
            cmds = cmds.join ' && '
            child = exec cmds, (err, stdout, stderr) ->
                if err and err.code is 1 and /No such process/.test(stderr)
                    return fs.unlink pidfile, (err) ->
                        return callback err if err
                        return callback null, false
                else if err
                    return callback err
                callback null, true
            #child.on 'exit', (code) ->
                #return callback new Error "Unexpected exit code #{code}" unless code is 0
                #fs.unlinkSync pidfile
                #callback null, true
    else
        pid = cmdOrChild.pid
        cmds = []
        cmds.push "for i in `ps -ef | awk '$3 == '#{pid}' { print $2 }'` ; do kill $i ; done"
        cmds.push "kill #{pid}"
        cmds = cmds.join ' && '
        child = exec(cmds)
        child.on 'exit', (code) ->
            return callback new Error "Unexpected exit code #{code}" unless code is 0
            callback null, true
