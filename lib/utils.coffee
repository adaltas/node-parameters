
path = require 'path'

module.exports =
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