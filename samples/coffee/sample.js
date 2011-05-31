#!/usr/bin/env node

    var shell = require('shell');
    
    var app = new shell.Shell({
        project_dir: __dirname
    });
    
    app.configure(function() {
        app.use(shell.history({
            shell: app
        }));
        app.use(shell.router({
            shell: app
        }));
        app.use(shell.coffee({
            shell: app,
            stdout: __dirname+'/coffee.out.log',
            stderr: __dirname+'/coffee.err.log',
            pidfile: __dirname+'/coffee.pid',
            detach: false
        }));
        app.use(shell.help({
            shell: app,
            introduction: true
        }));
    });
    