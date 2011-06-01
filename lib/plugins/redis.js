
var fs = require('fs'),
    path = require('path'),
    spawn = require('child_process').spawn;

module.exports = function(settings){
    // Validation
    if(!settings.shell){
        throw new Error('No shell provided');
    }
    if(!settings.config){
        throw new Error('No path to the Redis configuration file');
    }
    var shell = settings.shell;
    // Default settings
    settings.workspace = settings.workspace || shell.project_dir;
    // Register commands
    var redis;
    shell.on('exit', function() {
        if (shell.isShell && !settings.detach && redis) {
            redis.kill();
        }
    });
    shell.cmd('redis start', 'Start Redis', function(req, res, next) {
        var args = [];
        args.push(settings.config);
        redis = spawn('redis-server', args);
        if(settings.stdout){
            redis.stdout.pipe(
                typeof settings.stdout === 'string'
                ? fs.createWriteStream(settings.stdout)
                : settings.stdout
            );
        }
        if(settings.stderr){
            redis.stderr.pipe(
                typeof settings.stderr === 'string'
                ? fs.createWriteStream(settings.stderr)
                : settings.stderr
            );
        }
        if(!shell.isShell || settings.detach){
            var pidfile = settings.pidfile || '/tmp/redis.pid';
            fs.writeFileSync(pidfile,''+redis.pid);
        }
        // Give a chance to redis to startup
        setTimeout(function(){
			if(redis){
				res.cyan('Redis started').ln();
			}
        	res.prompt();
        },500);
    });
    shell.cmd('redis stop', 'Stop Redis', function(req, res, next) {
        if(!shell.isShell || settings.detach){
            var pidfile = settings.pidfile || '/tmp/redis.pid';
            if(!path.existsSync(pidfile)){
            	return res.red('Failed to stop redis').prompt();
            }
            var pid = fs.readFileSync(pidfile);
			return spawn('kill',[pid])
			.on('exit', function(code){
				code === 0
				? res.cyan('Redis successfully stoped')
				: res.red('Error while stoping Redis');
				fs.unlinkSync(pidfile);
				res.prompt();
			});
        }else if (redis) {
            redis.on('exit', function(code) {
            	redis = null;
                res.cyan('Redis successfully stopped');
                res.prompt();
            });
            redis.kill();
        } else {
            res.prompt();
        }
    });
}

