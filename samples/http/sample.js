#!/usr/bin/env node

    var fs = require('fs'),
        exec = require('child_process').exec,
        spawn = require('child_process').spawn,
        shell = require('shell');
    
    process.chdir(__dirname);
    
    // App
    var app = new shell.Shell();
    app.configure(function(){
        app.use(shell.history({shell: app}));
        app.use(shell.completer({shell: app}));
        app.use(shell.router({shell: app}));
        app.use(shell.help({shell: app, introduction: true}));
        shell.redis({
            shell: app,
            config: 'redis.conf',
            stdout: 'logs/redis.out.log',
            stderr: 'logs/redis.err.log',
            pidfile: 'tmp/redis.pid'
        })
        app.use(shell.error({shell: app}));
    });
    app.on('exit', function(){
        if(redis){ redis.kill(); }
        if(server){ server.kill(); }
    });
    // Installation
    app.cmd('install', 'Install dependencies', function(req, res, next){
        var cmds = [
            'npm install express',
            'npm install cluster',
            'npm install connect-redis'
        ];
        exec(cmds.join(' && ')).on('exit', function(code){
            code === 0
            ? res.cyan('Module successfully installed')
            : res.red('Error while installing modules');
            res.prompt();
        });
    });
    // HTTP Commands
    var server;
    app.cmd('server start', 'Start the HTTP server', function(req, res, next){
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