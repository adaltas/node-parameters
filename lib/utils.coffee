
path = require 'path'

module.exports =
    pad: (n, size) ->
        n = n.toString()
        pad = ''
        size = size - n.length
        for i in [0 .. size]
            pad += ' '
        n + pad
    flatten: (arr, ret) ->
        ret ?= []
        for i in [0 ... arr.length]
            if Array.isArray arr[i]
                @flatten arr[i], ret
            else
                ret.push arr[i]
        ret
    # Discovery the project root directory or return null if undiscoverable
    workspace: () ->
        dirs = require('module')._nodeModulePaths process.cwd()
        for dir in dirs
            if path.existsSync(dir) || path.existsSync(path.normalize(dir + '/../package.json'))
                return path.normalize dir + '/..'