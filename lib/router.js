
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
			fn = route.fn,
			regexp = route.regexp,
			keys = route.keys;
		if (captures = regexp.exec(req.command)) {
			fn._params = {};
			var index = 0;
			for (var j = 1, len = captures.length; j < len; ++j) {
				var key = keys[j-1],
					val = typeof captures[j] === 'string'
						? querystring.unescape(captures[j])
						: captures[j];
				if (key) {
					fn._params[key] = val;
				} else {
					fn._params[''+index] = val;
					index++;
				}
			}
			fn._index = i;
			return fn;
		}
	}
}

module.exports = function router(options){
	// Validation
	if(!options.shell){
		throw new Error('No shell provided');
	}
	var shell = options.shell;
	// Expose routes
	var routes = shell.routes = [];
	shell.cmd = function cmd(command, description, fn){
		if(typeof description === 'function'){
			fn = description, description = null;
		}
		var route = {
			command: command,
			description: description,
			fn: fn
		};
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
                req.params = route._params;
                try { 
                    route.call(self, req, res, function(err){
                        if (err === true) {
                            next();
                        } else if (err) {
                            next(err);
                        } else {
                            pass(route._index+1);
                        }
                    });
                } catch (err) {
                    next(err);
                }
            } else {
                next();
            }
        })();
	};
};

