
utils = require '../utils'

querystring =
    unescape: (str) ->
        decodeURIComponent str
    parse: (qs, sep, eq) ->
        sep = sep or '&'
        eq = eq or '='
        obj = {}
        return obj if typeof qs isnt 'string'
        vkps = qs.split sep
        for kvp in vkps
            x = kvp.split eq
            k = querystring.unescape x[0], true
            v = querystring.unescape x.slice(1).join(eq), true
            if not k in obj
                obj[k] = v
            else if not Array.isArray obj[k]
                obj[k] = [obj[k], v]
            else
                obj[k].push v
        obj

normalizeCommand = (command, keys) ->
    command = command
    .concat('/?')
    .replace /\/\(/g, '(?:/'
    .replace /(\/)?(\.)?:(\w+)(\?)?/g, (_, slash, format, key, optional) ->
        keys.push key
        slash ?= ''
        ''
        + (if optional then '' else slash)
        + '(?:'
        + (if optional then slash else '')
        + (format or '') + '([^/.]+))'
        + (optional or '')
    .replace(/([\/.])/g, '\\$1')
    .replace(/\*/g, '(.+)')
    new RegExp '^' + command + '$', 'i'

match = (req, routes, i) ->
    from ?= 0
    to = routes.length - 1
    #for (len = routes.length; i < len; ++i) {
    for i in [from .. to]
        route = routes[i]
        fn = route.callback
        regexp = route.regexp
        keys = route.keys
        captures = regexp.exec req.command
        if captures
            route.params = {}
            index = 0
            #for (j = 1, len = captures.length; j < len; ++j) {
            for j in [1 .. captures.length]
                key = keys[j-1]
                val =
                    if typeof captures[j] is 'string'
                    then querystring.unescape captures[j]
                    else captures[j]
                if key
                    route.params[key] = val
                else
                    route.params[''+index] = val
                    index++
            req._route_index = i
            return route

module.exports = router = (settings) ->
    # Validation
    throw new Error 'No shell provided' if not settings.shell
    shell = settings.shell
    # Expose routes
    routes = shell.routes = []
    params = {}
    shell.param = (name, fn) ->
        if Array.isArray name
            name.forEach (name) ->
                this.param name, fn
            , this
        else
            name = name.substr(1) if ':' is name[0]
            params[name] = fn
        this
    shell.cmd = (command, description, middleware1, middleware2, fn) ->
        args = Array.prototype.slice.call arguments
        route = {}
        route.command = args.shift()
        route.description = args.shift() if typeof args[0] is 'string'
        route.callback = args.pop()
        route.middlewares = utils.flatten args
        keys = []
        route.regexp = 
            if   route.command instanceof RegExp
            then route.command
            else normalizeCommand route.command, keys
        route.keys = keys
        routes.push route
        this
    # Register 'quit' command
    shell.cmd 'quit', 'Exit this shell', shell.quit
    # middleware
    router = (req, res, next) ->
        route = null
        self = this
        i = 0
        do (i) ->
            route = match req, routes, i
            return next() if not route
            i = 0
            keys = route.keys
            req.params = route.params
            # Param preconditions
            err = null
            do (err) ->
                try
                    key = keys[ i++ ]
                    val = req.params[ key ]
                    fn = params[ key ]
                    if 'route' is err
                        pass req._route_index + 1
                    # Error
                    else if err
                        next err
                    # Param has callback
                    else if fn
                        # Return style
                        if 1 is fn.length
                            req.params[key] = fn val
                            param()
                        # Middleware style
                        else
                            fn req, res, param, val
                    # Finished processing params
                    else if not key
                        # route middleware
                        i = 0
                        nextMiddleware = (err) ->
                            fn = route.middlewares[ i++ ]
                            if 'route' is err
                                pass req._route_index + 1
                            else if err
                                next err
                            else if fn
                                fn req, res, nextMiddleware
                            else
                                route.callback.call self, req, res, (err) ->
                                    if err
                                        next err
                                    else
                                        pass req._route_index + 1
                        nextMiddleware()
                    # More params
                    else
                        param()
                catch err
                    next err
