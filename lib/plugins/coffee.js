var exec, fs, path;
fs = require('fs');
path = require('path');
exec = require('child_process').exec;
module.exports = function(settings) {
  var coffee, enrichFiles, shell, _ref;
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
  coffee = null;
  shell.on('exit', function() {
    if (shell.isShell && !settings.detach && coffee) {
      return coffee.kill();
    }
  });
  enrichFiles = function(files) {
    if (!settings.workspace) {
      return null;
    }
    return files.split(' ').map(function(file) {
      if (file.substr(0, 1) !== '/') {
        file = '/' + file;
      }
      if (file.substr(-1, 1) !== '/' && fs.statSync(file).isDirectory()) {
        file += '/';
      }
      return file;
    }).join(' ');
  };
  shell.cmd('coffee start', 'Start CoffeeScript', function(req, res, next) {
    var args, detached, pidfile, pipeStderr, pipeStdout;
    args = [];
    detached = !shell.isShell || settings.detach;
    pipeStdout = settings.stdout && !detached;
    pipeStderr = settings.stderr && !detached;
    if (settings.join) {
      args.push('-j');
      args.push(enrichFiles(settings.join));
    }
    args.push('-w');
    if (settings.lint) {
      args.push('-l');
    }
    if (settings.require) {
      args.push('-r');
      args.push(settings.require);
    }
    args.push('-b');
    /*
            # Not sure if this apply to wath mode
            # The node executable has some useful options you can set,
            # such as --debug and --max-stack-size. Use this flag to
            # forward options directly to Node.js. 
            if(settings.nodejs){
                args.push('--nodejs');
                args.push(settings.nodejs);
            }
            */
    if (settings.output) {
      args.push('-o');
      args.push(enrichFiles(settings.output));
    }
    if (!settings.compile) {
      settings.compile = settings.workspace;
    }
    if (settings.compile) {
      args.push('-c');
      args.push(enrichFiles(settings.compile));
    }
    if (!pipeStdout) {
      args.push('>');
      args.push(settings.stdout || '/dev/null');
    }
    if (!pipeStderr) {
      args.push('2>');
      args.push(settings.stderr || '/dev/null');
    }
    args.unshift('coffee');
    args = args.join(' ');
    coffee = exec(args);
    if (pipeStdout) {
      coffee.stdout.pipe(typeof settings.stdout === 'string' ? fs.createWriteStream(settings.stdout) : settings.stdout);
    }
    if (pipeStderr) {
      coffee.stderr.pipe(typeof settings.stderr === 'string' ? fs.createWriteStream(settings.stderr) : settings.stderr);
    }
    if (detached) {
      pidfile = settings.pidfile || '/tmp/coffee.pid';
      fs.writeFileSync(pidfile, '' + coffee.pid);
    }
    return setTimeout(function() {
      if (coffee) {
        res.cyan('CoffeeScript started').ln();
      }
      return res.prompt();
    }, 500);
  });
  return shell.cmd('coffee stop', 'Stop CoffeeScript', function(req, res, next) {
    var cmds, pid, pidfile;
    if (!shell.isShell || settings.detach || !coffee) {
      pidfile = settings.pidfile || '/tmp/coffee.pid';
      pid = fs.readFileSync(pidfile);
      cmds = [];
      cmds.push("for i in `ps -ef| awk '$3 == '" + pid + "' { print $2 }'` ; do kill $i ; done");
      cmds.push("kill " + pid);
      cmds = cmds.join(' && ');
      coffee = exec(cmds);
      return coffee.on('exit', function(code) {
        if (code === 0) {
          res.cyan('coffee successfully stoped');
        } else {
          res.red('Error while stoping coffee');
        }
        fs.unlinkSync(pidfile);
        return res.prompt();
      });
    } else if (coffee) {
      coffee.on('exit', function(code) {
        coffee = null;
        res.cyan('CoffeeScript successfully stopped');
        return res.prompt();
      });
      return coffee.kill();
    } else {
      console.log('this should not appear');
      return res.prompt();
    }
  });
};