#!/usr/bin/env node

    var fs = require('fs'),
        exec = require('child_process').exec,
        spawn = require('child_process').spawn,
        shell = require('shell');
    
    // App
    var app = new shell.Shell();
    app.configure(function(){
        app.use(shell.history({shell: app}));
        app.use(shell.completer({shell: app}));
        app.use(shell.router({shell: app}));
        app.use(shell.help({shell: app, introduction: true}));
        app.use(shell.error({shell: app}));
    });
    app.on('exit', function(){
        if(redis){ redis.kill(); }
        if(server){ server.kill(); }
    });
    
    // Runtime & exit
    var redis, server;
    
    app.cmd('install', 'Install node modules', function(req, res, next){
        var cmds = [
            'npm install express',
            'npm install cluster',
            'npm install connect-redis'
        ];
        exec(cmds.join(' && '))
        .on('exit', function(code){
            if(code === 0){
                res.cyan('Module successfully installed');
            }else{
                res.red('Error while installing modules');
            }
            res.prompt();
        });
    });
    
    // Commands
    app.cmd('redis start', 'Start the redis database', function(req, res, next){
        redis = spawn('redis-server', [__dirname+'/redis.conf']);
        redis.stdout.pipe(fs.createWriteStream(__dirname+'/logs/redis.out.log'));
        redis.stderr.pipe(fs.createWriteStream(__dirname+'/logs/redis.err.log'));
        redis.on('exit', function(code){
            if(code !== 0){
                res.red('Redis exit with code '+code);
                redis = null;
            }
        });
        setTimeout(function(){
            res.prompt();
        },500);
    });
    
    app.cmd('redis stop', 'Stop the redis database', function(req, res, next){
        if(!redis){
            return res.red('Redis not started'), res.prompt();
        }
        redis.on('exit', function(code){
            if (code === 0) {
                res.cyan('Redis quit successfully');
            }
            res.prompt();
        });
        redis.kill();
    });
    
    app.cmd('server start', 'Start the HTTP server', function(req, res, next){
        if(!redis){
            return res.red('Redis not started'), res.prompt();
        }
        server = spawn('node', [__dirname+'/lib/server']);
        server.stdout.pipe(fs.createWriteStream(__dirname+'/logs/server.out.log'));
        server.stderr.pipe(fs.createWriteStream(__dirname+'/logs/server.err.log'));
        server.on('exit', function(code){
            if(code !== 0){
                res.red('Server exit with code '+code);
                server = null;
            }
        })
        res.prompt();
    });
    
    app.cmd('server stop', 'Stop the HTTP server', function(req, res, next){
        if(!server){
            return res.red('Server not started'), res.prompt();
        }
        server.on('exit', function(code){
            if (code === 0) {
                res.cyan('Server quit successfully');
            }
            res.prompt();
        });
        server.kill();
    });