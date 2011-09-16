
module.exports = class Request
    constructor: (shell, command) ->
        @shell = shell
        @command = command
    confirm: (msg, defaultTrue, callback) ->
        @shell.confirm.apply @shell, arguments
    question: (questions, callback) ->
        @shell.question.apply @shell, arguments
