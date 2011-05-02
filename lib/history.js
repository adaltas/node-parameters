
var fs = require('fs'),
	path = require('path'),
	styles = require('./styles')();

module.exports = function(options){
	// Validation
	if(!options.shell){
		throw new Error('No shell provided');
	}
	// Only in shell mode
	if(!options.shell.isShell){
		return;
	}
	// Persist readline history
	var historyFile = options.historyFile || process.cwd()+'/.node_shell';
	if(path.existsSync(historyFile)){
		try{
			options.shell.interface.history = JSON.parse(fs.readFileSync(historyFile,'utf8'));
		}catch(e){
			console.error(e.message);
			styles.red('Corrupted history file'); 
		}
	}
	var historyStream = fs.createWriteStream(historyFile,{flag:'w'});
	Interface.prototype._addHistory = (function(parent){
		return function(){
			if(this.history.length){
				var buffer = new Buffer( JSON.stringify( this.history ) );
				fs.write(historyStream.fd, buffer, 0, buffer.length, 0);
			}
			return parent.apply(this, arguments);
		};
	})(Interface.prototype._addHistory);
}

