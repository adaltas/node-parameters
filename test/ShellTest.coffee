
shell = require '../index'
assert = require 'assert'

module.exports =
    ###
    Note
    version 0.4.x didn't hold currentprocess if `process.stdin`
    was referenced, so `app.quit()` was not required
    ###
    'Shell # default constructor': (next) ->
        # Test object
        app = new shell { command: '' }
        assert.ok app instanceof shell
        app.quit()
        # Test function
        app = shell { command: '' }
        assert.ok app instanceof shell
        app.quit()
        next()