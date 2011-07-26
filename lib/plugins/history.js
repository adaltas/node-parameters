
var fs = require('fs'),
    path = require('path'),
    Interface = require('readline').Interface,
    crypto = require('crypto');

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
    // Default to ~/.node_shell/{md5(workspace)}
    if(!settings.historyFile && !path.existsSync(process.env['HOME']+'/.node_shell')){
        fs.mkdirSync(process.env['HOME']+'/.node_shell',0700);
    }
    var historyFile = settings.historyFile || process.env['HOME']+'/.node_shell/'+crypto.createHash('md5').update(settings.shell.project_dir).digest('hex');
    if(path.existsSync(historyFile)){
        try{
            settings.shell.interface.history = JSON.parse(fs.readFileSync(historyFile,'utf8'));
        }catch(e){
            settings.shell.styles.red('Corrupted history file').ln(); 
        }
    }
    var historyStream = fs.createWriteStream(historyFile, {flag:'w'});
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

