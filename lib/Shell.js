var EventEmitter, Interface, Request, Response, Shell, events, mod, path, readline, styles, util;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
util = require('util');
mod = require('module');
path = require('path');
readline = require('readline');
events = require('events');
EventEmitter = events.EventEmitter;
styles = require('./styles');
Request = require('./Request');
Response = require('./Response');
Interface = require('readline').Interface;
Interface.prototype.setPrompt = (function(parent) {
  return function(prompt, length) {
    var args;
    args = Array.prototype.slice.call(arguments);
    if (!args[1]) {
      args[1] = args[0].replace(/\x1b.*?m/g, '').length;
    }
    return parent.apply(this, args);
  };
})(Interface.prototype.setPrompt);
Shell = module.exports = function(settings) {
  var dir, dirs, _base, _base2, _base3, _i, _len, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
  if (!(this instanceof Shell)) {
    return new Shell(settings);
  }
  EventEmitter.call(this);
    if ((_ref = this.settings) != null) {
    _ref;
  } else {
    this.settings = {};
  };
    if ((_ref2 = (_base = this.settings).prompt) != null) {
    _ref2;
  } else {
    _base.prompt = '>> ';
  };
    if ((_ref3 = (_base2 = this.settings).stdin) != null) {
    _ref3;
  } else {
    _base2.stdin = process.stdin;
  };
    if ((_ref4 = (_base3 = this.settings).stdout) != null) {
    _ref4;
  } else {
    _base3.stdout = process.stdout;
  };
  this.set('env', (_ref5 = (_ref6 = this.settings.env) != null ? _ref6 : process.env.NODE_ENV) != null ? _ref5 : 'development');
  this.stack = [];
  this.styles = styles({
    stdout: this.settings.stdout
  });
  this.interface = readline.createInterface(this.settings.stdin, this.settings.stdout);
  process.on('exit', __bind(function() {
    return this.emit('exit');
  }, this));
  process.on('uncaughtException', __bind(function(e) {
    this.emit('exit', [e]);
    this.styles.red('Internal error, closing...').ln();
    console.error(e.message);
    console.error(e.stack);
    return process.exit();
  }, this));
  this.isShell = (_ref7 = settings.isShell) != null ? _ref7 : process.argv.length === 2;
  this.project_dir = null;
  dirs = mod._nodeModulePaths(process.cwd());
  for (_i = 0, _len = dirs.length; _i < _len; _i++) {
    dir = dirs[_i];
    if (path.existsSync(dir) || path.existsSync(path.normalize(dir + '/../package.json'))) {
      this.project_dir = path.normalize(dir + '/..');
      break;
    }
  }
  return process.nextTick(__bind(function() {
    this.cmd('quit', 'Exit this shell', this.quit);
    if (this.isShell) {
      return this.prompt();
    } else {
      return this.run(process.argv.slice(2).join(' '));
    }
  }, this));
};
util.inherits(Shell, EventEmitter);
Shell.prototype.configure = function(env, fn) {
  if (typeof env === 'function') {
    fn = env;
    env = 'all';
  }
  if (env === 'all' || env === this.settings.env) {
    fn.call(this);
  }
  return this;
};
Shell.prototype.use = function(handle) {
  if (handle) {
    this.stack.push({
      route: null,
      handle: handle
    });
  }
  return this;
};
Shell.prototype.cmds = {};
Shell.prototype.run = function(command) {
  var index, next, req, res, self;
  command = command.trim();
  this.emit('command', [command]);
  this.emit(command, []);
  self = this;
  req = new Request(this, command);
  res = new Response({
    shell: this,
    stdout: this.settings.stdout
  });
  index = 0;
  next = function(err) {
    var arity, layer;
    layer = self.stack[index++];
    if (!layer) {
      res.red('Command failed to execute' + (err ? ': ' + err.message : ''));
      return res.prompt();
    }
    arity = layer.handle.length;
    if (err) {
      if (arity === 4) {
        return layer.handle(err, req, res, next);
      } else {
        return next(err);
      }
    } else if (arity < 4) {
      return layer.handle(req, res, next);
    } else {
      return next();
    }
  };
  return next();
};
Shell.prototype.set = function(setting, val) {
  if (!(val != null)) {
    if (this.settings.hasOwnProperty(setting)) {
      return this.settings[setting];
    } else if (this.parent) {
      return this.parent.set(setting);
    }
  } else {
    this.settings[setting] = val;
    return this;
  }
};
Shell.prototype.prompt = function() {
  if (this.isShell) {
    return this.interface.question(this.styles.raw(this.settings.prompt, {
      color: 'green'
    }), this.run.bind(this));
  } else {
    this.styles.ln();
    return process.exit();
  }
};
Shell.prototype.quit = function(params) {
  return process.exit();
};