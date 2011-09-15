
crypto = require 'crypto'
exec = require('child_process').exec
fs = require 'fs'
path = require 'path'

md5 = (cmd) ->
    crypto.createHash('md5').update(cmd).digest('hex')

pidfile = (cmd) ->
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
        pipe = "</dev/null >#{cmdStdout} 2>#{cmdStdout}"
        info = 'echo $? $!'
        child = exec "#{cmd} #{pipe} & #{info}", (err, stdout, stderr) ->
            [code, pid] = stdout.split(' ')
            return callback new Error "Process exit with code #{code}" if code isnt '0'
            pidfile = settings.pidfile or pidfile cmd
            console.log 'pidfile', pidfile
            fs.writeFileSync pidfile, '' + pid
            callback null, pid
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
        pidfile = settings.pidfile or pidfile cmdOrChild
        return callback null, false unless path.existsSync pidfile
        pid = fs.readFileSync pidfile, 'ascii'
        cmds = []
        cmds.push "for i in `ps -ef| awk '$3 == '#{pid}' { print $2 }'` ; do kill $i ; done"
        cmds.push "kill #{pid}"
        cmds = cmds.join ' && '
        child = exec(cmds)
        child.on 'exit', (code) ->
            return callback new Error "Unexpected exit code #{code}" unless code is 0
            fs.unlinkSync pidfile
            callback null, true
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
