
var util = require('util'),
	readline = require('readline'),
	EventEmitter = require('events').EventEmitter,
	router = require('./router'),
	styles = require('./styles');

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

var Shell = module.exports = function(options){
	if (!(this instanceof Shell)) {
		return new Shell(options);
	}
	EventEmitter.call(this);
	options = options || {};
	this.stdin = options.stdin || process.stdin;
	this.stdout = options.stdout || process.stdout;
	this.styles = styles(this.stdout);
	this.interface = readline.createInterface(
		this.stdin,
		this.stdout
	);
	process.on('exit', function(){
		this.emit('exit');
	}.bind(this));
	process.on('uncaughtException', function (e) {
		this.emit('exit');
		this.styles.red('Internal error, closing...').ln();
		console.error(e.message);
		console.error(e.stack);
		process.exit();
	}.bind(this));
	this.isShell = process.argv.length === 2;
	// Prepare routing
	this.router = router();
	this.cmd('quit', 'Exit this shell', this.quit);
	// Start
	process.nextTick(function(){
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
Shell.prototype.configure = function(env, callback){
  if ('function' == typeof env) {
    fn = env, env = 'all';
  }
  if ('all' == env || env == this.settings.env) {
    fn.call(this);
  }
  return this;
}

// Configure callback for the given `env`
Shell.prototype.use = function(plugin){
  // don't do much yet
  return this;
}

// Store commands
Shell.prototype.cmds = {};

// Register new commands
Shell.prototype.cmd = function(command, description, fn){
	if(typeof description === 'function'){
		fn = description, description = null;
	}
	this.router.register({
		command: command,
		description: description,
		fn: fn
	});
};
// Run a command
Shell.prototype.run = function(command){
	command = command.trim();
	this.router.route(command, function(err){
		if(err){
			return this.styles.red(err.message), this.prompt();
		}
		this.prompt();
	}.bind(this));
};
// Display prompt
Shell.prototype.prompt = function(){
	if(this.isShell){
		this.interface.question(this.styles.raw('>> ',{color: 'green'}), this.run.bind(this));
	}else{
		this.styles.ln();
		process.exit();
	}
};
// Command quit
Shell.prototype.quit = function(params){
	process.exit();
};
// Utils pad
Shell.prototype.pad = function(n, size) {
	var n = n.toString(),
		pad = '',
		size = size-n.length; 
	for (i=0; i < size; i++){ 
		pad += ' '; 
	}
	return n + pad; 
}