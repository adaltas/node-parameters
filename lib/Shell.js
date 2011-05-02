
var util = require('util'),
	readline = require('readline'),
	EventEmitter = require('events').EventEmitter,
	styles = require('./styles')();

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

var Shell = module.exports = function(){
	if (!(this instanceof Shell)) {
		return new Shell();
	}
	EventEmitter.call(this);
	this.interface = readline.createInterface(
		process.stdin,
		process.stdout,
		function(text){
			var suggestions = [];
			for(var k in this.cmds){
				if(k.substr(0, text.length) === text){
					suggestions.push(k);
				}
			}
			return [suggestions,text];
		}.bind(this)
	);
	process.on('exit', function(){
		this.emit('exit');
	}.bind(this));
	process.on('uncaughtException', function (e) {
		this.emit('exit');
		styles.red('Internal error, closing...').ln();
		console.error(e.message);
		console.error(e.stack);
		process.exit();
	}.bind(this));
	this.isShell = process.argv.length === 2;
	// Register help command
	this.cmd('help', 'Show this message', this.help.bind(this));
	this.cmd('', this.help.bind(this));
	this.cmd('quit', 'Exit this shell', this.quit);
	// Start
	if(this.isShell){
		styles.println('Type "help" for a list of available commands');
		this.prompt();
	}else{
		process.nextTick(function(){
			this.run( process.argv.slice(2).join(' ') );
		}.bind(this));
	}
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
Shell.prototype.cmd = function(path, description, callback){
	if(typeof description === 'function'){
		callback = description, description = null;
	}
	this.cmds[path] = {
		description: description,
		callback: callback
	}
};
// Run a command
Shell.prototype.run = function(command){
	command = command.trim();
	if(!this.cmds[command]){
		return styles.red('Invalid command',command), this.prompt();
	}
	this.cmds[command].callback({},function(){
		this.prompt();
	}.bind(this));
};
// Display prompt
Shell.prototype.prompt = function(path, description, callback){
	if(this.isShell){
		this.interface.question(styles.raw('>> ',{color: 'green'}), this.run.bind(this));
	}else{
		styles.ln();
		process.exit();
	}
};
// Command help
Shell.prototype.help = function(params){
	styles.cyan('Available commands:').ln();
	for(var k in this.cmds){
		var cmd = this.cmds[k];
		if(cmd.description){
			styles.cyan(this.pad(k, 20)).white(cmd.description).ln();
		}
	}
	this.prompt();
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