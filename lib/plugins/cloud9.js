var exec, fs, path;
fs = require('fs');
path = require('path');
exec = require('child_process').exec;
module.exports = function(settings) {
  var cloud9, shell, _ref, _ref2, _ref3;
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
    if ((_ref2 = settings.stdout) != null) {
    _ref2;
  } else {
    settings.stdout = '/dev/null';
  };
    if ((_ref3 = settings.stderr) != null) {
    _ref3;
  } else {
    settings.stderr = '/dev/null';
  };
  cloud9 = null;
  shell.on('exit', function() {
    if (shell.isShell && !settings.detach && cloud9) {
      return cloud9.kill();
    }
  });
  shell.cmd('cloud9 start', 'Start Cloud9', function(req, res, next) {
    var args, detached, pidfile;
    args = [];
    detached = !shell.isShell || settings.detach;
    args.push('-w');
    args.push(settings.workspace);
    if (settings.config) {
      args.push('-c');
      args.push(settings.config);
    }
    if (settings.group) {
      args.push('-g');
      args.push(settings.group);
    }
    if (settings.user) {
      args.push('-u');
      args.push(settings.user);
    }
    if (settings.action) {
      args.push('-a');
      args.push(settings.action);
    }
    if (settings.ip) {
      args.push('-l');
      args.push(settings.ip);
    }
    if (settings.port) {
      args.push('-p');
      args.push(settings.port);
    }
    if (detached) {
      args.push('>');
      args.push(settings.stdout || '/dev/null');
    }
    if (detached) {
      args.push('2>');
      args.push(settings.stderr || '/dev/null');
    }
    args.unshift('cloud9');
    args = args.join(' ');
    cloud9 = exec(args);
    if (detached) {
      pidfile = settings.pidfile || '/tmp/cloud9.pid';
      fs.writeFileSync(pidfile, '' + cloud9.pid);
    } else {
      cloud9.stdout.pipe(typeof settings.stdout === 'string' ? fs.createWriteStream(settings.stdout) : settings.stdout);
      cloud9.stderr.pipe(typeof settings.stderr === 'string' ? fs.createWriteStream(settings.stderr) : settings.stderr);
    }
    return setTimeout(function() {
      var ip, message, port;
      if (cloud9) {
        ip = settings.ip || '127.0.0.1';
        port = settings.port || 3000;
        message = "Cloud9 started http://" + ip + ":" + port;
        res.cyan(message).ln();
      }
      return res.prompt();
    }, 500);
  });
  return shell.cmd('cloud9 stop', 'Stop Cloud9', function(req, res, next) {
    var cmds, pid, pidfile;
    if (!shell.isShell || settings.detach || !cloud9) {
      pidfile = settings.pidfile || '/tmp/cloud9.pid';
      pid = fs.readFileSync(pidfile);
      cmds = [];
      cmds.push("for i in `ps -ef| awk '$3 == '" + pid + "' { print $2 }'` ; do kill $i ; done");
      cmds.push("kill " + pid);
      cloud9 = exec(cmds.join(' && '));
      return cloud9.on('exit', function(code) {
        if (code === 0) {
          res.cyan('Cloud9 successfully stoped').ln();
        } else {
          res.red('Error while stoping Cloud9').ln();
        }
        fs.unlinkSync(pidfile);
        return res.prompt();
      });
    } else if (cloud9) {
      cloud9.on('exit', function(code) {
        cloud9 = null;
        res.cyan('Cloud9 successfully stopped').ln();
        return res.prompt();
      });
      return cloud9.kill();
    } else {
      console.log('this should not appear');
      return res.prompt();
    }
  });
};