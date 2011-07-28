
fs = require 'fs'
path = require 'path'
exec = require('child_process').exec

module.exports = (settings) ->
    # Validation
    throw new Error 'No shell provided' if not settings.shell
    shell = settings.shell
    # Default settings
    settings.workspace ?= shell.project_dir
    throw new Error 'No workspace provided' if not settings.workspace
    # Register commands
    coffee = null
    shell.on 'exit', ->
        if shell.isShell and not settings.detach and coffee
            coffee.kill()
    # Sanitize a list of files separated by spaces
    enrichFiles = (files) ->
        return null if not settings.workspace
        return files.split(' ').map( (file) ->
            if file.substr(0,1) isnt '/'
                file = '/' + file
            if file.substr(-1,1) isnt '/' and fs.statSync(file).isDirectory()
                file += '/'
            file
        ).join ' '
    shell.cmd 'coffee start', 'Start CoffeeScript', (req, res, next) ->
        args = []
        detached = not shell.isShell or settings.detach
        pipeStdout = settings.stdout and not detached
        pipeStderr = settings.stderr and not detached
        # Before compiling, concatenate all scripts together in the
        # order they were passed, and write them into the specified
        # file. Useful for building large projects.
        if settings.join
            args.push '-j'
            args.push enrichFiles(settings.join)
        # Watch the modification times of the coffee-scripts,
        # recompiling as soon as a change occurs.
        args.push '-w'
        # If the jsl (JavaScript Lint) command is installed, use it
        # to check the compilation of a CoffeeScript file. (Handy
        # in conjunction with --watch)
        if settings.lint
            args.push '-l'
        # Load a library before compiling or executing your script.
        # Can be used to hook in to the compiler (to add Growl
        # notifications, for example).
        if settings.require
            args.push '-r'
            args.push settings.require
        # Compile the JavaScript without the top-level function
        # safety wrapper. (Used for CoffeeScript as a Node.js module.)
        args.push '-b'
        ###
        # Not sure if this apply to wath mode
        # The node executable has some useful options you can set,
        # such as --debug and --max-stack-size. Use this flag to
        # forward options directly to Node.js. 
        if(settings.nodejs){
            args.push('--nodejs');
            args.push(settings.nodejs);
        }
        ###
        # Write out all compiled JavaScript files into the specified
        # directory. Use in conjunction with --compile or --watch.
        # if(!settings.output && path.existsSync(settings.workspace+'/lib')){
        #     settings.output = settings.workspace+'/lib/';
        # }
        if settings.output
            args.push '-o'
            args.push enrichFiles(settings.output)
        # Compile a .coffee script into a .js JavaScript file
        # of the same name.
        # if(!settings.compile && path.existsSync(settings.workspace+'/src')){
        #     settings.compile = settings.workspace+'/src/';
        # }
        if not settings.compile
            settings.compile = settings.workspace
        if settings.compile
            args.push '-c'
            args.push enrichFiles(settings.compile)
        if not pipeStdout
            args.push '>'
            args.push settings.stdout || '/dev/null'
        if not pipeStderr
            args.push '2>'
            args.push settings.stderr || '/dev/null'
        args.unshift 'coffee'
        args = args.join ' '
        coffee = exec args
        if pipeStdout
            coffee.stdout.pipe(
                if   typeof settings.stdout is 'string'
                then fs.createWriteStream settings.stdout
                else settings.stdout
            )
        if pipeStderr
            coffee.stderr.pipe(
                if   typeof settings.stderr is 'string'
                then fs.createWriteStream settings.stderr
                else settings.stderr
            )
        if detached
            pidfile = settings.pidfile or '/tmp/coffee.pid'
            fs.writeFileSync pidfile, '' + coffee.pid
        # Give a chance to coffee to startup
        setTimeout( ->
            res.cyan('CoffeeScript started').ln() if coffee
            res.prompt()
        , 500)
    shell.cmd 'coffee stop', 'Stop CoffeeScript', (req, res, next) ->
        if not shell.isShell or settings.detach or not coffee
            pidfile = settings.pidfile or '/tmp/coffee.pid'
            pid = fs.readFileSync pidfile
            cmds = []
            cmds.push "for i in `ps -ef| awk '$3 == '#{pid}' { print $2 }'` ; do kill $i ; done"
            cmds.push "kill #{pid}"
            cmds = cmds.join ' && '
            coffee = exec(cmds)
            coffee.on 'exit', (code) ->
                if   code is 0
                then res.cyan 'coffee successfully stoped'
                else res.red 'Error while stoping coffee'
                fs.unlinkSync pidfile
                res.prompt()
        else if coffee
            coffee.on 'exit', (code) ->
                coffee = null
                res.cyan 'CoffeeScript successfully stopped'
                res.prompt()
            coffee.kill()
        else
            console.log 'this should not appear'
            res.prompt()

