var exec, fs, path;
fs = require('fs');
path = require('path');
exec = require('child_process').exec;
module.exports = function(settings) {
  var http, shell, _ref, _ref2, _ref3;
  if (!settings.shell) {
    throw new Error('No shell provided');
  }
  shell = settings.shell;
    if ((_ref = settings.workspace) != null) {
    _ref;
  } else {
    settings.workspace = shell.project_dir;
  };
  if (!settings.workspace) {
    throw new Error('No workspace provided');
  }
    if ((_ref2 = settings.message_start) != null) {
    _ref2;
  } else {
    settings.message_start = 'HTTP server successfully started';
  };
    if ((_ref3 = settings.message_stop) != null) {
    _ref3;
  } else {
    settings.message_stop = 'HTTP server successfully stopped';
  };
  http = null;
  shell.on('exit', function() {
    if (shell.isShell && !settings.detach && http) {
      return http.kill();
    }
  });
  shell.cmd('http start', 'Start HTTP server', function(req, res, next) {
    var args, detached, done, interval, pidfile, pipeStderr, pipeStdout;
    args = [];
    detached = !shell.isShell || settings.detach;
    pipeStdout = settings.stdout && !detached;
    pipeStderr = settings.stderr && !detached;
    args.push('-w');
    args.push(settings.workspace);
    if (!pipeStdout) {
      args.push('>');
      args.push(settings.stdout);
    }
    if (!pipeStderr) {
      args.push('2>');
      args.push(settings.stderr);
    }
    if (path.existsSync(settings.workspace + '/server.js')) {
      args.unshift('node ' + settings.workspace + '/server');
    } else if (path.existsSync(settings.workspace + '/app.js')) {
      args.unshift('node ' + settings.workspace + '/app');
    } else {
      next(new Error('Failed to find appropriate "server.js" or "app.js" file'));
    }
    args = args.join(' ');
    http = exec(args);
    done = false;
    interval = setInterval(function() {
      if (done) {
        return clearInterval(interval);
      }
    }, 100);
    http.on('exit', function(code) {
      if (code === 0) {
        res.cyan(settings.message_start);
      } else {
        res.red('Error while starting HTTP server');
      }
      if (path.existsSync(pidfile)) {
        fs.unlinkSync(pidfile);
      }
      res.prompt();
      return done = true;
    });
    if (pipeStdout) {
      http.stdout.pipe(typeof settings.stdout === 'string' ? fs.createWriteStream(settings.stdout) : settings.stdout);
    }
    if (pipeStderr) {
      http.stderr.pipe(typeof settings.stderr === 'string' ? void 0 : fs.createWriteStream(settings.stderr), settings.stderr);
    }
    if (detached) {
      pidfile = settings.pidfile || '/tmp/http.pid';
      return fs.writeFileSync(pidfile, '' + http.pid);
    }
  });
  return shell.cmd('http stop', 'Stop HTTP server', function(req, res, next) {
    var cmds, pid, pidfile;
    if (!shell.isShell || settings.detach) {
      pidfile = settings.pidfile || '/tmp/http.pid';
      pid = fs.readFileSync(pidfile);
      cmds = [];
      cmds.push("for i in `ps -ef| awk '$3 == '" + pid + "' { print $2 }'` ; do kill $i ; done");
      cmds.push("kill " + pid);
      cmds = cmds.join(' && ');
      http = exec(cmds);
      return http.on('exit', function(code) {
        if (code === 0) {
          res.cyan(settings.message_stop);
        } else {
          res.red('Error while stoping HTTP server');
        }
        fs.unlinkSync(pidfile);
        return res.prompt();
      });
    } else if (http) {
      http.on('exit', function(code) {
        http = null;
        res.cyan(settings.message_stop);
        return res.prompt();
      });
      return http.kill();
    } else {
      console.log('this should not appear');
      return res.prompt();
    }
  });
};