
var fs = require('fs'),
    path = require('path');

module.exports = function(settings){
    // Validation
    if(!settings.shell){
        throw new Error('No shell provided');
    }
    // Only in shell mode
    if(!settings.shell.isShell){
        return;
    }
    // Persist readline history
    var historyFile = settings.historyFile || process.cwd()+'/.node_shell';
    if(path.existsSync(historyFile)){
        try{
            settings.shell.interface.history = JSON.parse(fs.readFileSync(historyFile,'utf8'));
        }catch(e){
            settings.shell.styles.red('Corrupted history file').ln(); 
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

