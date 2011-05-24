#!/usr/bin/env node
    
    process.chdir(__dirname);

    var shell = require('shell');
    
    var app = new shell.Shell();
    
    app.configure(function() {
        app.use(shell.history({
            shell: app
        }));
        app.use(shell.router({
            shell: app
        }));
        app.use(shell.redis({
            shell: app,
            config: './redis.conf',
            stdout: __dirname+'/redis.out.log',
            stderr: __dirname+'/redis.err.log',
            pidfile: __dirname+'/redis.pid',
            detach: true
        }));
        app.use(shell.help({
            shell: app,
            introduction: true
        }));
    });
    
    app.cmd('redis keys :pattern', 'Find keys', function(req, res, next){
        if(!app.client){
            app.client = require('redis').createClient();
        }
        app.client.keys(req.params.pattern, function(err, keys){
            if(err){ return res.styles.red(err.message), next(); }
            res.cyan(keys.join('\n')||'no keys');
            res.prompt();
        });
    });
    