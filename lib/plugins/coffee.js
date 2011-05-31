
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
    settings.workspace = settings.workspace || shell.set('project_dir');
    if(!settings.workspace){
    	throw new Error('No workspace provided');
    }
    // Register commands
    var coffee;
    shell.on('exit', function() {
        if (shell.isShell && !settings.detach && coffee) {
            coffee.kill();
        }
    });
    function enrichFiles(files){
        if(!settings.workspace){
            return;
        }
        return files.split(' ').map(function(file){
            if(file.substr(0,1) !== '/'){
                file = '/'+file;
            }
            if(file.substr(-1,1)!=='/' && fs.statSync(file).isDirectory()){
                file += '/';
            }
            return file;
        }).join(' ');
    };
    shell.cmd('coffee start', 'Start CoffeeScript', function(req, res, next) {
        var args = [];
        var pipeStdout = settings.stdout && shell.isShell && !settings.detach;
        var pipeStderr = settings.stderr && shell.isShell && !settings.detach;
        // Before compiling, concatenate all scripts together in the
        // order they were passed, and write them into the specified
        // file. Useful for building large projects.
        if(settings.join){
            args.push('-j');
            args.push(enrichFiles(settings.join));
        }
        // Watch the modification times of the coffee-scripts,
        // recompiling as soon as a change occurs.
        args.push('-w');
        // If the jsl (JavaScript Lint) command is installed, use it
        // to check the compilation of a CoffeeScript file. (Handy
        // in conjunction with --watch)
        if(settings.lint){
            args.push('-l');
        }
        // Load a library before compiling or executing your script.
        // Can be used to hook in to the compiler (to add Growl
        // notifications, for example).
        if(settings.require){
            args.push('-r');
            args.push(settings.require);
        }
        // Compile the JavaScript without the top-level function
        // safety wrapper. (Used for CoffeeScript as a Node.js module.)
        args.push('-b');
        /* Not sure if this apply to wath mode
        // The node executable has some useful options you can set,
        // such as --debug and --max-stack-size. Use this flag to
        // forward options directly to Node.js. 
        if(settings.nodejs){
            args.push('--nodejs');
            args.push(settings.nodejs);
        }
        */
        // Write out all compiled JavaScript files into the specified
        // directory. Use in conjunction with --compile or --watch.
        if(!settings.output && path.existsSync(settings.workspace+'/lib')){
            settings.output = settings.workspace+'/lib/';
        }
        if(settings.output){
            args.push('-o');
            args.push(enrichFiles(settings.output));
        }
        // Compile a .coffee script into a .js JavaScript file
        // of the same name.
        if(!settings.compile && path.existsSync(settings.workspace+'/src')){
            settings.compile = settings.workspace+'/src/';
        }
        if(settings.compile){
            args.push('-c');
            args.push(enrichFiles(settings.compile));
        }
        if(!pipeStdout){
        	args.push('>');
        	args.push(settings.stdout);
        }
        if(!pipeStderr){
        	args.push('2>');
        	args.push(settings.stderr);
        }
        args.unshift('coffee');
        console.log(args.join(' '));
        coffee = exec(args.join(' '));
        if(pipeStdout){
            coffee.stdout.pipe(
                typeof settings.stdout === 'string'
                ? fs.createWriteStream(settings.stdout)
                : settings.stdout
            );
        }
        if(pipeStderr){
            coffee.stderr.pipe(
                typeof settings.stderr === 'string'
                ? fs.createWriteStream(settings.stderr)
                : settings.stderr
            );
        }
        if(!shell.isShell || settings.detach){
            var pidfile = settings.pidfile || '/tmp/coffee.pid';
            fs.writeFileSync(pidfile,''+coffee.pid);
        }
		// Give a chance to coffee to startup
        setTimeout(function(){
			if(coffee){
				res.cyan('CoffeeScript started').ln();
			}
        	res.prompt();
        },500);
    });
    shell.cmd('coffee stop', 'Stop CoffeeScript', function(req, res, next) {
        if(!shell.isShell || settings.detach || !coffee){
            var pidfile = settings.pidfile || '/tmp/coffee.pid';
            var pid = fs.readFileSync(pidfile);
            var cmds = [];
            cmds.push('for i in `ps -ef| awk \'$3 == \''+pid+'\' { print $2 }\'` ; do kill $i ; done');
            cmds.push('kill '+pid);
			return exec(cmds.join(' && '))
			.on('exit', function(code){
				code === 0
				? res.cyan('coffee successfully stoped')
				: res.red('Error while stoping coffee');
				fs.unlinkSync(pidfile);
				res.prompt();
			});
        }else if (coffee) {
            coffee.on('exit', function(code) {
            	coffee = null;
                res.cyan('CoffeeScript successfully stopped');
                res.prompt();
            });
            coffee.kill();
        } else {
            res.prompt();
        }
    });
}

