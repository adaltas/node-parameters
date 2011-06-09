#!/usr/bin/env node
    
    process.chdir(__dirname);
    
    var shell = require('shell');
    // Initialization
    var app = new shell.Shell();
    // Plugins registration
    app.configure(function() {
        app.use(shell.history({
            shell: app
        }));
        app.use(shell.router({
            shell: app
        }));
        app.use(shell.redis({
            shell: app,
            config: 'redis.conf',
            stdout: 'redis.out.log',
            stderr: 'redis.err.log',
            pidfile: 'redis.pid',
            detach: true
        }));
        app.use(shell.help({
            shell: app,
            introduction: true
        }));
    });
    // Command registration
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
    // Event notification
    app.on('redis stop', function(){
        if(app.client){
            app.client.quit();
        }
    });
    