var fs, path, spawn;
fs = require('fs');
path = require('path');
spawn = require('child_process').spawn;
module.exports = function(settings) {
  var redis, shell, _ref;
  if (!settings.shell) {
    throw new Error('No shell provided');
  }
  if (!settings.config) {
    throw new Error('No path to the Redis configuration file');
  }
  shell = settings.shell;
    if ((_ref = settings.workspace) != null) {
    _ref;
  } else {
    settings.workspace = shell.project_dir;
  };
  redis = null;
  shell.on('exit', function() {
    if (shell.isShell && !settings.detach && redis) {
      return redis.kill();
    }
  });
  shell.cmd('redis start', 'Start Redis', function(req, res, next) {
    var args, pidfile;
    args = [];
    args.push(settings.config);
    redis = spawn('redis-server', args);
    if (settings.stdout) {
      redis.stdout.pipe(typeof settings.stdout === 'string' ? fs.createWriteStream(settings.stdout) : settings.stdout);
    }
    if (settings.stderr) {
      redis.stderr.pipe(typeof settings.stderr === 'string' ? fs.createWriteStream(settings.stderr) : settings.stderr);
    }
    if (!shell.isShell && settings.detach) {
      pidfile = settings.pidfile || '/tmp/redis.pid';
      fs.writeFileSync(pidfile, '' + redis.pid);
    }
    return setTimeout(function() {
      if (redis) {
        res.cyan('Redis started').ln();
      }
      return res.prompt();
    }, 500);
  });
  return shell.cmd('redis stop', 'Stop Redis', function(req, res, next) {
    var pid, pidfile;
    if (!shell.isShell || settings.detach) {
      pidfile = settings.pidfile || '/tmp/redis.pid';
      if (!path.existsSync(pidfile)) {
        return res.red('Failed to stop redis').prompt();
      }
      pid = fs.readFileSync(pidfile);
      redis = spawn('kill', [pid]);
      return redis.on('exit', function(code) {
        if (code === 0) {
          res.cyan('Redis successfully stoped');
        } else {
          res.red('Error while stoping Redis');
        }
        fs.unlinkSync(pidfile);
        return res.prompt();
      });
    } else if (redis) {
      redis.on('exit', function(code) {
        redis = null;
        res.cyan('Redis successfully stopped');
        return res.prompt();
      });
      return redis.kill();
    } else {
      return res.prompt();
    }
  });
};