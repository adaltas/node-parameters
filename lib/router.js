var styles = require('./styles');

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
	
function match(comand, routes, i) {
	var captures,
		i = i || 0;
	for (var len = routes.length; i < len; ++i) {
		var route = routes[i],
			fn = route.fn,
			regexp = route.regexp,
			keys = route.keys;
		if (captures = regexp.exec(comand)) {
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

module.exports = function(options){
	// Validation
	if(!options.shell){
		throw new Error('No shell provided');
	}
	// Store
	var routes = [];
	function register(route){
		var keys = [];
		route.regexp = route.command instanceof RegExp
			? route.command
			: normalizeCommand(route.command, keys);
		route.keys = keys;
		routes.push(route);
		return this;
	};
	function route(command, next){
		var route,
			self = this;
		(function pass(i){
			if (route = match(command, routes, i)) {
				var params = route._params;
				try {
					var res = styles({stdout: options.shell.options.stdout});
					route.call(self,
						{command: command, params: params},
						res,
						next);
				} catch (err) {
					next(err);
				}
			} else {
				next(new Error('Invalid command "'+command+'"'));
			}
		})();
	};
	return {
		routes: routes,
		register: register,
		route: route
	};
};

