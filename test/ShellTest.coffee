
shell = require '../index'
assert = require 'assert'

module.exports =
    'Shell # default constructor': (next) ->
        # Test object
        app = new shell { command: '' }
        assert.ok app instanceof shell
        # Test function
        app = shell { command: '' }
        assert.ok app instanceof shell
        next()