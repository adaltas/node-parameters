
var utils = require('./utils');

var querystring = {
    unescape: function(str){
        return decodeURIComponent(str);
    },
    parse: function(qs, sep, eq){
        sep = sep || "&";
        eq = eq || "=";
        var obj = {};
        if (typeof qs !== 'string') {
            return obj;
        }
        var vkps = qs.split(sep);
        for(var i=0;i<vkps.length;i++){
            var kvp = vkps[i];
            var x = kvp.split(eq);
            var k = querystring.unescape(x[0], true);
            var v = querystring.unescape(x.slice(1).join(eq), true);
            if (!(k in obj)) {
                obj[k] = v;
            } else if (!Array.isArray(obj[k])) {
                obj[k] = [obj[k], v];
            } else {
                obj[k].push(v);
            }
        }
        return obj;
    }
}

function normalizeCommand(command, keys) {
    command = command
        .concat('/?')
        .replace(/\/\(/g, '(?:/')
        .replace(/(\/)?(\.)?:(\w+)(\?)?/g, function(_, slash, format, key, optional){
            keys.push(key);
            slash = slash || '';
            return ''
                + (optional ? '' : slash)
                + '(?:'
                + (optional ? slash : '')
                + (format || '') + '([^/.]+))'
                + (optional || '');
        })
        .replace(/([\/.])/g, '\\$1')
        .replace(/\*/g, '(.+)');
    return new RegExp('^' + command + '$', 'i');
}
    
function match(req, routes, i) {
    var captures,
        i = i || 0;
    for (var len = routes.length; i < len; ++i) {
        var route = routes[i],
            fn = route.callback,
            regexp = route.regexp,
            keys = route.keys;
        if (captures = regexp.exec(req.command)) {
            route.params = {};
            var index = 0;
            for (var j = 1, len = captures.length; j < len; ++j) {
                var key = keys[j-1],
                    val = typeof captures[j] === 'string'
                        ? querystring.unescape(captures[j])
                        : captures[j];
                if (key) {
                    route.params[key] = val;
                } else {
                    route.params[''+index] = val;
                    index++;
                }
            }
            req._route_index = i; // note, connect do it this way, fn._index = i;
            return route;
        }
    }
}

module.exports = function router(settings){
    // Validation
    if(!settings.shell){
        throw new Error('No shell provided');
    }
    var shell = settings.shell;
    // Expose routes
    var routes = shell.routes = [];
    var params = {};
    shell.param = function(name, fn){
    if (Array.isArray(name)) {
        name.forEach(function(name){
        this.param(name, fn);
        }, this);
    } else {
        if (':' == name[0]) name = name.substr(1);
        params[name] = fn;
    }
    return this;
    };
    shell.cmd = function cmd(command, description, middleware1, middleware2, fn){
        var args = Array.prototype.slice.call(arguments),
                route = {};
        route.command = args.shift();
        if(typeof args[0] === 'string'){
            route.description = args.shift();
        }
        route.callback = args.pop();
        route.middlewares = utils.flatten(args);
        var keys = [];
        route.regexp = route.command instanceof RegExp
            ? route.command
            : normalizeCommand(route.command, keys);
        route.keys = keys;
        routes.push(route);
        return this;
    };
    return function router(req, res, next){
                var route,
                        self = this;
                (function pass(i){
                        if (route = match(req, routes, i)) {
                var i = 0
                , keys = route.keys;
        
                req.params = route.params;
                // Param preconditions
                (function param(err) {
                try {
                    var key = keys[i++]
                    , val = req.params[key]
                    , fn = params[key];
        
                    if ('route' == err) {
                    pass(req._route_index + 1);
                    // Error
                    } else if (err) {
                    next(err);
                    // Param has callback
                    } else if (fn) {
                    // Return style
                    if (1 == fn.length) {
                        req.params[key] = fn(val);
                        param();
                    // Middleware style
                    } else {
                        fn(req, res, param, val);
                    }
                    // Finished processing params
                    } else if (!key) {
                    // route middleware
                    i = 0;
                    (function nextMiddleware(err){
                        var fn = route.middlewares[i++];
                        if ('route' == err) {
                        pass(req._route_index + 1);
                        } else if (err) {
                        next(err);
                        } else if (fn) {
                        fn(req, res, nextMiddleware);
                        } else {
                        route.callback.call(self, req, res, function(err){
                            if (err) {
                            next(err);
                            } else {
                            pass(req._route_index + 1);
                            }
                        });
                        }
                    })();
                    // More params
                    } else {
                    param();
                    }
                } catch (err) {
                    next(err);
                }
                })();
                        } else {
                                next();
                        }
                })();
    };
};

