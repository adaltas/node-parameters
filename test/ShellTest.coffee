
shell = require '../index'
assert = require 'assert'

module.exports =
    'Shell # default constructor': (next) ->
        # Test object
        app = new shell.Shell { command: '' }
        assert.ok app instanceof shell.Shell
        # Test function
        app = shell.Shell { command: '' }
        assert.ok app instanceof shell.Shell
        next()