
var util = require('util'),
    mod = require('module'),
    path = require('path'),
    readline = require('readline'),
    EventEmitter = require('events').EventEmitter,
    styles = require('./styles'),
    Request = require('./Request'),
    Response = require('./Response');

// Fix readline interface
Interface = require('readline').Interface
Interface.prototype.setPrompt = (function(parent){
    return function(prompt, length) {
        var args = Array.prototype.slice.call(arguments);
        if(!args[1]){
            args[1] = args[0].replace(/\x1b.*?m/g, '').length;
        }
        return parent.apply(this, args);
    };
})(Interface.prototype.setPrompt);

var Shell = module.exports = function(settings){
    if (!(this instanceof Shell)) {
        return new Shell(settings);
    }
    EventEmitter.call(this);
    this.settings = settings || {};
    this.settings.prompt = this.settings.prompt || '>> ';
    this.settings.stdin = this.settings.stdin || process.stdin;
    this.settings.stdout = this.settings.stdout || process.stdout;
    this.set('env', this.settings.env || process.env.NODE_ENV || 'development');
    this.stack = [];
    this.styles = styles({stdout: this.settings.stdout});
    this.interface = readline.createInterface(
        this.settings.stdin,
        this.settings.stdout
    );
    process.on('exit', function(){
        this.emit('exit');
    }.bind(this));
    process.on('uncaughtException', function (e) {
        this.emit('exit',[e]);
        this.styles.red('Internal error, closing...').ln();
        console.error(e.message);
        console.error(e.stack);
        process.exit();
    }.bind(this));
    this.isShell = process.argv.length === 2;
    // Project root directory
    this.project_dir = null;
    var dirs = mod._nodeModulePaths(process.cwd());
    for(var i=0; i<dirs.length; i++){
        if(path.existsSync(dirs[i]) || path.existsSync(path.normalize(dirs[i]+'/../package.json'))){
            this.project_dir = path.normalize(dirs[i]+'/..');
            break;
        }
    }
    // Start
    process.nextTick(function(){
        // Carefull, router need to be here
        this.cmd('quit', 'Exit this shell', this.quit);
        if(this.isShell){
            this.prompt();
        }else{
            this.run( process.argv.slice(2).join(' ') );
        }
    }.bind(this));
};

// Extends EventEmitter
util.inherits(Shell, EventEmitter);

// Configure callback for the given `env`
Shell.prototype.configure = function(env, fn){
    if ('function' == typeof env) {
        fn = env, env = 'all';
    }
    if ('all' == env || env == this.settings.env) {
        fn.call(this);
    }
    return this;
}

// Configure callback for the given `env`
Shell.prototype.use = function(handle){
    // Add the route, handle pair to the stack
    if(handle){
        this.stack.push({ route: null, handle: handle });
    }
    
    // Allow chaining
    return this;
}

// Store commands
Shell.prototype.cmds = {};

// Run a command
Shell.prototype.run = function(command){
    command = command.trim();
    this.emit('command', [command]);
    this.emit(command, []);
    var self = this,
        req = new Request(this, command),
        res = new Response({shell: this, stdout: this.settings.stdout}),
        index = 0;
    function next(err){
        var layer = self.stack[index++];
        if(!layer){
            return res.red('Command failed to execute'+ (err ? ': '+err.message : '')), res.prompt();
        }
        var arity = layer.handle.length;
        if (err) {
            if (arity === 4) {
                layer.handle(err, req, res, next);
            } else {
                next(err);
            }
        } else if (arity < 4) {
            layer.handle(req, res, next);
        } else {
            next();
        }
    }
    next();
};

Shell.prototype.set = function(setting, val){
  if (val === undefined) {
    if (this.settings.hasOwnProperty(setting)) {
      return this.settings[setting];
    } else if (this.parent) { // for the future, parent is undefined for now
      return this.parent.set(setting);
    }
  } else {
    this.settings[setting] = val;
    return this;
  }
};

// Display prompt
Shell.prototype.prompt = function(){
    if(this.isShell){
        this.interface.question(this.styles.raw(this.settings.prompt,{color: 'green'}), this.run.bind(this));
    }else{
        this.styles.ln();
        process.exit();
    }
};

// Command quit
Shell.prototype.quit = function(params){
    process.exit();
};
