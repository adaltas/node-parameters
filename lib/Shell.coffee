
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
        parent.apply this, args
)( Interface.prototype.setPrompt )

Shell = module.exports = (settings) ->
    return new Shell(settings) if this not instanceof Shell
    EventEmitter.call this
    this.settings ?= {}
    this.settings.prompt ?= '>> '
    this.settings.stdin ?= process.stdin
    this.settings.stdout ?= process.stdout
    this.set 'env', this.settings.env ? process.env.NODE_ENV ? 'development'
    this.stack = []
    this.styles = styles {stdout: this.settings.stdout}
    this.interface = readline.createInterface this.settings.stdin, this.settings.stdout
    process.on 'exit', =>
        this.emit('exit')
    process.on 'uncaughtException', (e) =>
        this.emit 'exit', [e]
        this.styles.red('Internal error, closing...').ln()
        console.error e.message
        console.error e.stack
        process.exit()
    this.isShell = process.argv.length is 2
    # Project root directory
    this.project_dir = null
    dirs = mod._nodeModulePaths process.cwd()
    for dir in dirs
        if path.existsSync(dir) || path.existsSync(path.normalize(dir + '/../package.json'))
            this.project_dir = path.normalize dir + '/..'
            break
    # Start
    process.nextTick =>
        # Carefull, router need to be here
        this.cmd 'quit', 'Exit this shell', this.quit
        if this.isShell
            this.prompt()
        else
            this.run  process.argv.slice(2).join(' ')

# Extends EventEmitter
util.inherits Shell, EventEmitter

# Configure callback for the given `env`
Shell.prototype.configure = (env, fn) ->
    fn = env
    env = 'all' if typeof env is 'function'
    fn.call this if 'all' == env || env == this.settings.env
    this

# Configure callback for the given `env`
Shell.prototype.use = (handle) ->
    # Add the route, handle pair to the stack
    if handle
        this.stack.push { route: null, handle: handle }
    # Allow chaining
    return this

# Store commands
Shell.prototype.cmds = {}

# Run a command
Shell.prototype.run = (command) ->
    command = command.trim()
    this.emit 'command', [command]
    this.emit command, []
    self = this
    req = new Request this, command
    res = new Response {shell: this, stdout: this.settings.stdout}
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
        if this.settings.hasOwnProperty setting
            return this.settings[setting]
        else if this.parent
            # for the future, parent being undefined for now
            return this.parent.set setting
    else
        this.settings[setting] = val
        return this

# Display prompt
Shell.prototype.prompt = ->
    if this.isShell
        this.interface.question this.styles.raw( this.settings.prompt, {color: 'green'}), this.run.bind(this)
    else
        this.styles.ln()
        process.exit()

# Command quit
Shell.prototype.quit = (params) ->
    process.exit()
