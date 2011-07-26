
var fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec;

module.exports = function(settings){
    // Validation
    if(!settings.shell){
        throw new Error('No shell provided');
    }
    var shell = settings.shell;
    // Default settings
    settings.workspace = settings.workspace || shell.project_dir;
    if(!settings.workspace){
        throw new Error('No workspace provided');
    }
    // Register commands
    var http;
    shell.on('exit', function() {
        if (shell.isShell && !settings.detach && http) {
            http.kill();
        }
    });
    if(!settings.message_start){
        settings.message_start = 'HTTP server successfully started';
    }
    if(!settings.message_stop){
        settings.message_stop = 'HTTP server successfully stopped';
    }
    shell.cmd('http start', 'Start HTTP server', function(req, res, next) {
        var args = [];
        var detached = !shell.isShell || settings.detach;
        var pipeStdout = settings.stdout && !detached;
        var pipeStderr = settings.stderr && !detached;
        args.push('-w');
        args.push(settings.workspace);
        if(!pipeStdout){
            args.push('>');
            args.push(settings.stdout);
        }
        if(!pipeStderr){
            args.push('2>');
            args.push(settings.stderr);
        }
        if(path.existsSync(settings.workspace+'/server.js')){
            args.unshift('node '+settings.workspace+'/server');
        }else if(path.existsSync(settings.workspace+'/app.js')){
            args.unshift('node '+settings.workspace+'/app');
        }else{
            next(new Error('Failed to find appropriate "server.js" or "app.js" file'));
        }
        http = exec(args.join(' '));
        var done = false;
        var interval = setInterval(function(){
            if(done){
                clearInterval(interval);
            }
        }, 100);
        http.on('exit', function(code){
                code === 0
                ? res.cyan(settings.message_start)
                : res.red('Error while starting HTTP server');
                if(path.existsSync(pidfile)){
                    fs.unlinkSync(pidfile);
                }
                res.prompt();
                done = true;
        });
        if(pipeStdout){
            http.stdout.pipe(
                typeof settings.stdout === 'string'
                ? fs.createWriteStream(settings.stdout)
                : settings.stdout
            );
        }
        if(pipeStderr){
            http.stderr.pipe(
                typeof settings.stderr === 'string'
                ? fs.createWriteStream(settings.stderr)
                : settings.stderr
            );
        }
        if(detached){
            var pidfile = settings.pidfile || '/tmp/http.pid';
            fs.writeFileSync(pidfile,''+http.pid);
        }
        // Give a chance to http to startup
        // and open a browser window in command mode
        /*
        setTimeout(function(){
            if(http){
                res.cyan('HTTP server started').ln();
            }
            res.prompt();
        },500);
        */
    });
    shell.cmd('http stop', 'Stop HTTP server', function(req, res, next) {
        if(!shell.isShell || settings.detach){
            var pidfile = settings.pidfile || '/tmp/http.pid';
            var pid = fs.readFileSync(pidfile);
            var cmds = [];
            cmds.push('for i in `ps -ef| awk \'$3 == \''+pid+'\' { print $2 }\'` ; do kill $i ; done');
            cmds.push('kill '+pid);
            return exec(cmds.join(' && '))
            .on('exit', function(code){
                code === 0
                ? res.cyan( settings.message_stop )
                : res.red('Error while stoping HTTP server');
                fs.unlinkSync(pidfile);
                res.prompt();
            });
        }else if (http) {
            http.on('exit', function(code) {
                http = null;
                res.cyan( settings.message_stop );
                res.prompt();
            });
            http.kill();
        } else {
            console.log( 'this should not appear' );
            res.prompt();
        }
    });
}

