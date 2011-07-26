
var path = require('path');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

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
    if(!settings.glob){
        settings.glob = 'test/*.js'
    }
    // Register commands
    shell.cmd('test', 'Run all test', function(req, res, next) {
        function run(cmd){
            var args = [];
            args.push(cmd);
            if(settings.coverage){
                args.push('--cov');
            }
            if(settings.serial){
                args.push('--serial');
            }
            if(settings.glob){
                args.push(settings.glob)
            }
            var expresso = exec('cd '+settings.workspace+' && '+args.join(' '));
            expresso.stdout.on('data', function(data){
                res.cyan(data);
            });
            expresso.stderr.on('data', function(data){
                res.magenta(data);
            });
            expresso.on('exit', function(code){
                res.prompt();
            });
        }
        var paths = [].concat(module.paths, require.paths);
        for(var i=0; i<paths.length; i++){
            var p = paths[i];
            p = p+'/expresso/bin/expresso';
            if(path.existsSync(p)){
                return run(p);
            }
        }
        return res.magenta('Expresso not found'), res.prompt();
    });
    shell.cmd('test :glob', 'Run specific tests', function(req, res, next) {
    });
}

