#!/usr/bin/env node

	var fs = require('fs'),
		exec = require('child_process').exec,
		spawn = require('child_process').spawn,
		shell = require('shell'),
		styles = shell.styles();
	
	// App
	var app = new shell.Shell();
	app.configure(function(){
		app.use( shell.history({shell: app}) );
		app.use( shell.completer({shell: app}) );
		app.use( shell.help({shell: app, introduction: true}) );
	});
	app.on('exit', function(){
		if(redis){ redis.kill(); }
		if(server){ server.kill(); }
	});
	
	// Runtime & exit
	var redis, server;
	
	app.cmd('install', 'Install node modules', function(answer, next){
		var cmds = [
			'npm install express',
			'npm install cluster',
			'npm install connect-redis'
		];
		exec(cmds.join(' && '))
		.on('exit', function(code){
			if(code === 0){
				styles.cyan('Module successfully installed');
			}else{
				styles.red('Error while installing modules');
			}
			next();
		});
	});
	
	// Commands
	app.cmd('redis start', 'Start the redis database', function(answer, next){
		redis = spawn('redis-server', [__dirname+'/redis.conf']);
		redis.stdout.pipe(fs.createWriteStream(__dirname+'/logs/redis.out.log'));
		redis.stderr.pipe(fs.createWriteStream(__dirname+'/logs/redis.err.log'));
		redis.on('exit', function(code){
			if(code !== 0){
				styles.red('Redis exit with code '+code);
				redis = null;
			}
		});
		setTimeout(function(){
			next();
		},500);
	});
	
	app.cmd('redis stop', 'Stop the redis database', function(answer, next){
		if(!redis){
			return styles.red('Redis not started'), next();
		}
		redis.on('exit', function(code){
			if (code === 0) {
				styles.cyan('Redis quit successfully');
			}
			next();
		});
		redis.kill();
	});
	
	app.cmd('server start', 'Start the HTTP server', function(answer, next){
		if(!redis){
			return styles.red('Redis not started'), next();
		}
		server = spawn('node', [__dirname+'/lib/server']);
		server.stdout.pipe(fs.createWriteStream(__dirname+'/logs/server.out.log'));
		server.stderr.pipe(fs.createWriteStream(__dirname+'/logs/server.err.log'));
		server.on('exit', function(code){
			if(code !== 0){
				styles.red('Server exit with code '+code);
				server = null;
			}
		})
		next();
	});
	
	app.cmd('server stop', 'Stop the HTTP server', function(answer, next){
		if(!server){
			return styles.red('Server not started'), next();
		}
		server.on('exit', function(code){
			if (code === 0) {
				styles.cyan('Server quit successfully');
			}
			next();
		});
		server.kill();
	});