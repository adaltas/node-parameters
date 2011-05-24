
var fs = require('fs'),
    path = require('path'),
    spawn = require('child_process').spawn;

module.exports = function(settings){
    // Validation
    if(!settings.shell){
        throw new Error('No shell provided');
    }
    var shell = settings.shell;
    // Default settings
    settings.workspace = settings.workspace || shell.project_dir;
    // Register commands
    var cloud9;
    shell.on('exit', function() {
        if (shell.isShell && !settings.detach && cloud9) {
            cloud9.kill();
        }
    });
    shell.cmd('cloud9 start', 'Start Cloud9', function(req, res, next) {
        var args = [];
        args.push('-w');
        args.push(settings.workspace);
        if(settings.config){
            args.push('-c');
            args.push(settings.config);
        }
        if(settings.group){
            args.push('-g');
            args.push(settings.group);
        }
        if(settings.user){
            args.push('-u');
            args.push(settings.user);
        }
        if(settings.action){
            args.push('-a');
            args.push(settings.action);
        }
        if(settings.ip){
            args.push('-l');
            args.push(settings.ip);
        }
        if(settings.port){
            args.push('-p');
            args.push(settings.port);
        }
        cloud9 = spawn('cloud9', args);
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
        if(!shell.isShell || settings.detach){
            var pidfile = settings.pidfile || '/tmp/cloud9.pid';
            fs.writeFileSync(pidfile,''+cloud9.pid);
        }
		// Give a chance to cloud9 to startup
		// and open a browser window in command mode
        setTimeout(function(){
			if(cloud9){
				res.cyan('Redis started').ln();
			}
        	res.prompt();
        },500);
    });
    shell.cmd('cloud9 stop', 'Stop Cloud9', function(req, res, next) {
        if(!shell.isShell || settings.detach){
            var pidfile = settings.pidfile || '/tmp/cloud9.pid';
            var pid = fs.readFileSync(pidfile);
			return spawn('kill',[pid])
			.on('exit', function(code){
				code === 0
				? res.cyan('Cloud9 successfully stoped')
				: res.red('Error while stoping Cloud9');
				fs.unlinkSync(pidfile);
				res.prompt();
			});
        }else if (cloud9) {
            cloud9.on('exit', function(code) {
            	cloud9 = null;
                res.cyan('Cloud9 successfully stopped');
                res.prompt();
            });
            cloud9.kill();
        } else {
            res.prompt();
        }
    });
}

