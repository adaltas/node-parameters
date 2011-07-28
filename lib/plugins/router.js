var match, normalizeCommand, querystring, router, utils;
var __indexOf = Array.prototype.indexOf || function(item) {
  for (var i = 0, l = this.length; i < l; i++) {
    if (this[i] === item) return i;
  }
  return -1;
};
utils = require('../utils');
querystring = {
  unescape: function(str) {
    return decodeURIComponent(str);
  },
  parse: function(qs, sep, eq) {
    var k, kvp, obj, v, vkps, x, _i, _len, _ref;
    sep = sep || '&';
    eq = eq || '=';
    obj = {};
    if (typeof qs !== 'string') {
      return obj;
    }
    vkps = qs.split(sep);
    for (_i = 0, _len = vkps.length; _i < _len; _i++) {
      kvp = vkps[_i];
      x = kvp.split(eq);
      k = querystring.unescape(x[0], true);
      v = querystring.unescape(x.slice(1).join(eq), true);
      if (_ref = !k, __indexOf.call(obj, _ref) >= 0) {
        obj[k] = v;
      } else if (!Array.isArray(obj[k])) {
        obj[k] = [obj[k], v];
      } else {
        obj[k].push(v);
      }
    }
    return obj;
  }
};
normalizeCommand = function(command, keys) {
  command = command.concat('/?').replace(/\/\(/g, '(?:/'.replace(/(\/)?(\.)?:(\w+)(\?)?/g, function(_, slash, format, key, optional) {
    keys.push(key);
        if (slash != null) {
      slash;
    } else {
      slash = '';
    };
    '';
    +(optional ? '' : slash);
    +'(?:';
    +(optional ? slash : '');
    +(format || '') + '([^/.]+))';
    return +(optional || '');
  })).replace(/([\/.])/g, '\\$1').replace(/\*/g, '(.+)');
  return new RegExp('^' + command + '$', 'i');
};
match = function(req, routes, i) {
  var captures, fn, index, j, key, keys, regexp, route, to, val, _ref;
    if (typeof from !== "undefined" && from !== null) {
    from;
  } else {
    from = 0;
  };
  to = routes.length - 1;
  for (i = from; from <= to ? i <= to : i >= to; from <= to ? i++ : i--) {
    route = routes[i];
    fn = route.callback;
    regexp = route.regexp;
    keys = route.keys;
    captures = regexp.exec(req.command);
    if (captures) {
      route.params = {};
      index = 0;
      for (j = 1, _ref = captures.length; 1 <= _ref ? j <= _ref : j >= _ref; 1 <= _ref ? j++ : j--) {
        key = keys[j - 1];
        val = typeof captures[j] === 'string' ? querystring.unescape(captures[j]) : captures[j];
        if (key) {
          route.params[key] = val;
        } else {
          route.params['' + index] = val;
          index++;
        }
      }
      req._route_index = i;
      return route;
    }
  }
};
module.exports = router = function(settings) {
  var params, routes, shell;
  if (!settings.shell) {
    throw new Error('No shell provided');
  }
  shell = settings.shell;
  routes = shell.routes = [];
  params = {};
  shell.param = function(name, fn) {
    if (Array.isArray(name)) {
      name.forEach(function(name) {
        return this.param(name, fn);
      }, this);
    } else {
      if (':' === name[0]) {
        name = name.substr(1);
      }
      params[name] = fn;
    }
    return this;
  };
  shell.cmd = function(command, description, middleware1, middleware2, fn) {
    var args, keys, route;
    args = Array.prototype.slice.call(arguments);
    route = {};
    route.command = args.shift();
    if (typeof args[0] === 'string') {
      route.description = args.shift();
    }
    route.callback = args.pop();
    route.middlewares = utils.flatten(args);
    keys = [];
    route.regexp = route.command instanceof RegExp ? route.command : normalizeCommand(route.command, keys);
    route.keys = keys;
    routes.push(route);
    return this;
  };
  return router = function(req, res, next) {
    var i, route, self;
    route = null;
    self = this;
    i = 0;
    return (function(i) {
      var err, keys;
      route = match(req, routes, i);
      if (!route) {
        return next();
      }
      i = 0;
      keys = route.keys;
      req.params = route.params;
      err = null;
      return (function(err) {
        var fn, key, nextMiddleware, val;
        try {
          key = keys[i++];
          val = req.params[key];
          fn = params[key];
          if ('route' === err) {
            return pass(req._route_index + 1);
          } else if (err) {
            return next(err);
          } else if (fn) {
            if (1 === fn.length) {
              req.params[key] = fn(val);
              return param();
            } else {
              return fn(req, res, param, val);
            }
          } else if (!key) {
            i = 0;
            nextMiddleware = function(err) {
              fn = route.middlewares[i++];
              if ('route' === err) {
                return pass(req._route_index + 1);
              } else if (err) {
                return next(err);
              } else if (fn) {
                return fn(req, res, nextMiddleware);
              } else {
                return route.callback.call(self, req, res, function(err) {
                  if (err) {
                    return next(err);
                  } else {
                    return pass(req._route_index + 1);
                  }
                });
              }
            };
            return nextMiddleware();
          } else {
            return param();
          }
        } catch (err) {
          return next(err);
        }
      })(err);
    })(i);
  };
};