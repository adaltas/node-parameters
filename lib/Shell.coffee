
util = require 'util'
mod = require 'module'
path = require 'path'
readline = require 'readline'
events = require 'events'
EventEmitter = events.EventEmitter
styles = require './styles'
Request = require './Request'
Response = require './Response'

# Fix readline interface
Interface = require('readline').Interface
Interface.prototype.setPrompt = ( (parent) ->
    (prompt, length) ->
        args = Array.prototype.slice.call arguments
        args[1] = args[0].replace(/\x1b.*?m/g, '').length if not args[1]
        parent.apply @, args
)( Interface.prototype.setPrompt )

Shell = module.exports = (settings) ->
    return new Shell(settings) if @ not instanceof Shell
    EventEmitter.call @
    @settings ?= {}
    @settings.prompt ?= '>> '
    @settings.stdin ?= process.stdin
    @settings.stdout ?= process.stdout
    @set 'env', @settings.env ? process.env.NODE_ENV ? 'development'
    @stack = []
    @styles = styles {stdout: @settings.stdout}
    @interface = readline.createInterface @settings.stdin, @settings.stdout
    process.on 'exit', =>
        @emit('exit')
    process.on 'uncaughtException', (e) =>
        @emit 'exit', [e]
        @styles.red('Internal error, closing...').ln()
        console.error e.message
        console.error e.stack
        process.exit()
    @isShell = this.settings.isShell ? process.argv.length is 2
    # Project root directory
    @project_dir = null
    dirs = mod._nodeModulePaths process.cwd()
    for dir in dirs
        if path.existsSync(dir) || path.existsSync(path.normalize(dir + '/../package.json'))
            @project_dir = path.normalize dir + '/..'
            break
    # Start
    process.nextTick =>
        # Carefull, router need to be here
        @cmd 'quit', 'Exit this shell', @quit
        if @isShell
            @prompt()
        else
            @run  process.argv.slice(2).join(' ')

# Extends EventEmitter
util.inherits Shell, EventEmitter

# Configure callback for the given `env`
Shell.prototype.configure = (env, fn) ->
    if typeof env is 'function'
        fn = env
        env = 'all'
    if env is 'all' or env is @settings.env
        fn.call @
    @

# Configure callback for the given `env`
Shell.prototype.use = (handle) ->
    # Add the route, handle pair to the stack
    if handle
        @stack.push { route: null, handle: handle }
    # Allow chaining
    @

# Store commands
Shell.prototype.cmds = {}

# Run a command
Shell.prototype.run = (command) ->
    command = command.trim()
    @emit 'command', [command]
    @emit command, []
    self = @
    req = new Request @, command
    res = new Response {shell: @, stdout: @settings.stdout}
    index = 0
    next = (err) ->
        layer = self.stack[ index++ ]
        if not layer
            res.red 'Command failed to execute'+ ( if err then ': ' + err.message else '')
            return res.prompt()
        arity = layer.handle.length
        if err
            if arity is 4
                layer.handle err, req, res, next
            else
                next err
        else if arity < 4
            layer.handle req, res, next
        else
            next()
    next()

Shell.prototype.set = (setting, val) ->
    if not val?
        if @settings.hasOwnProperty setting
            return @settings[setting]
        else if @parent
            # for the future, parent being undefined for now
            return @parent.set setting
    else
        @settings[setting] = val
        @

# Display prompt
Shell.prototype.prompt = ->
    if @isShell
        @interface.question @styles.raw( @settings.prompt, {color: 'green'}), @run.bind(@)
    else
        @styles.ln()
        process.exit()

# Command quit
Shell.prototype.quit = (params) ->
    process.exit()
