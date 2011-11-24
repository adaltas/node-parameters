
util = require 'util'
readline = require 'readline'
events = require 'events'
EventEmitter = events.EventEmitter
each = require 'each'
utils = require './utils'
styles = require './Styles'
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

module.exports = class Shell extends EventEmitter
    constructor: (settings = {}) ->
        return new Shell(settings) if @ not instanceof Shell
        EventEmitter.call @
        @tmp = {}
        @settings = settings
        @settings.prompt ?= '>> '
        @settings.stdin ?= process.stdin
        @settings.stdout ?= process.stdout
        @set 'env', @settings.env ? process.env.NODE_ENV ? 'development'
        @set 'command', @settings.command ? process.argv.slice(2).join(' ')
        @stack = []
        @styles = styles {stdout: @settings.stdout}
        process.on 'beforeExit', =>
            @emit 'exit'
        process.on 'uncaughtException', (e) =>
            @emit 'exit', [e]
            @styles.red('Internal error, closing...').ln()
            console.error e.message
            console.error e.stack
            process.exit()
        @isShell = this.settings.isShell ? process.argv.length is 2
        @interface() if @isShell
        # Project root directory
        settings.workspace ?= utils.workspace()
        # Current working directory
        process.chdir settings.workspace if settings.chdir is true
        process.chdir settings.chdir if typeof settings.chdir is 'string'
        # Start
        process.nextTick =>
            if @isShell
                command = @set 'command'
                noPrompt = @set 'noPrompt'
                if command
                    @run command
                else if not noPrompt
                    @prompt() 
            else
                command = @set 'command'
                @run command
        return @
    
    # Return the readline interface and create it if not yet initialized
    interface: () ->
        return @_interface if @_interface?
        @_interface = readline.createInterface @settings.stdin, @settings.stdout
    
    # Configure callback for the given `env`
    configure: (env, fn) ->
        if typeof env is 'function'
            fn = env
            env = 'all'
        if env is 'all' or env is @settings.env
            fn.call @
        @
    
    # Configure callback for the given `env`
    use: (handle) ->
        # Add the route, handle pair to the stack
        if handle
            @stack.push { route: null, handle: handle }
        # Allow chaining
        @
    
    # Store commands
    cmds: {}
    
    # Run a command
    run: (command) ->
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
                if command isnt ''
                    res.red 'Command failed to execute ' + command + ( if err then ': ' + err.message else '')
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
    
    set: (setting, val) ->
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
    prompt: ->
        if @isShell
            @interface().question @styles.raw( @settings.prompt, {color: 'green'}), @run.bind(@)
        else
            @styles.ln()
            if process.versions
                @quit()
            else 
                # Node v0.6.1 throw error 'process.stdout cannot be closed'
                @settings.stdout.destroySoon();
                @settings.stdout.on 'close', ->
                    process.exit()
    
    # Ask one or more questions
    question: (questions, callback) ->
        isObject = questions? and typeof questions is 'object'
        answers = {}
        if isObject
            answers = []
            each questions, (question, settings, next) =>
                unless next
                    return callback answers
                settings = {value: settings} unless settings and typeof settings is 'object'
                @interface().question "#{question} [#{settings.value}]", (answer) ->
                    answers[question] = if answer is '' then settings.value else answer
                    next()
        else
            isArray = Array.isArray questions
            questions = [{name: questions, value: ''}] if typeof questions is 'string'
            each(questions)
            .on 'item', (next, question) =>
                q = question.name
                q += " [#{question.value}]" if question.value
                @interface().question q, (answer) ->
                    answers[question.name] = if answer is '' then question.value else answer
                    next()
            .on 'end', ->
                answers = answers[questions[0].name] unless isArray
                return callback answers
    
    # Ask a question with a boolean answer
    confirm: (msg, defaultTrue, callback) ->
        args = arguments
        unless callback
            callback = defaultTrue
            defaultTrue = true
        @settings.key_true ?= 'y'
        @settings.key_false ?= 'n'
        key_true = @settings.key_true.toLowerCase() 
        key_false = @settings.key_false.toLowerCase() 
        keyTrue  = if defaultTrue then key_true.toUpperCase()  else key_true
        keyFalse = if defaultTrue then key_false else key_false.toUpperCase()
        msg += " [#{keyTrue}#{keyFalse}]"
        @interface().question @styles.raw( msg, {color: 'green'}), (answer) =>
            accepted = ['', key_true, key_false]
            answer = answer.toLowerCase()
            valid = accepted.indexOf(answer) isnt -1
            return @confirm.apply(@, args) unless valid
            callback answer is key_true or (defaultTrue and answer is '')
    
    # Command quit
    quit: (params) ->
        @emit 'quit'
        @interface().close()
        process.stdin.destroy()
