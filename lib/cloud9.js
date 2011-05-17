
var fs = require('fs'),
    path = require('path'),
    shellOnly = require('./routes/shellOnly'),
    exec = require('child_process').exec;

module.exports = function(settings){
    // Validation
    if(!settings.shell){
        throw new Error('No shell provided');
    }
    // Default settings
    settings.workspace = settings.workspace || settings.shell.project_dir;
    // Register commands
    var cloud9;
    settings.shell.on('exit', function() {
        if (cloud9) {
            cloud9.kill();
        }
    });
    settings.shell.cmd('cloud9 start', 'Start Cloud9', shellOnly, function(req, res, next) {
        var cmd = 'cloud9 -w ' + settings.workspace;
        if(settings.config){
            cmd += ' -c '+settings.config;
        }
        if(settings.group){
            cmd += ' -g '+settings.group;
        }
        if(settings.user){
            cmd += ' -u '+settings.user;
        }
        if(settings.action){
            cmd += ' -a '+settings.action;
        }
        if(settings.ip){
            cmd += ' -l     '+settings.ip;
        }
        if(settings.port){
            cmd += ' -p '+settings.port;
        }
        cloud9 = exec(cmd, function(err, stdout, stderr) {});
        if(settings.stdout){
            cloud9.stdout.pipe(
                typeof settings.stdout === 'string'
                ? fs.createWriteStream(settings.stdout)
                : settings.stdout
            );
        }
        if(settings.stderr){
            cloud9.stderr.pipe(
                typeof settings.stderr === 'string'
                ? fs.createWriteStream(settings.stderr)
                : settings.stderr
            );
        }
        res.prompt();
    });
    settings.shell.cmd('cloud9 stop', 'Stop Cloud9', shellOnly, function(req, res, next) {
        if (cloud9) {
            cloud9.on('exit', function(code) {
                res.cyan('Cloud9 successfully stopped');
                res.prompt();
            });
            cloud9.kill();
        }
        else {
            res.prompt();
        }
    });
}

