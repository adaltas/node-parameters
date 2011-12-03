
each = require 'each'

module.exports = class Request
    constructor: (shell, command) ->
        @shell = shell
        @command = command
    confirm: (msg, defaultTrue, callback) ->
        @shell.confirm.apply @shell, arguments
    # Ask one or more questions
    question: (questions, callback) ->
        isObject = (v) -> typeof v is 'object' and v? and not Array.isArray v
        multiple = true
        answers = {}
        if isObject questions
            questions = for q, v of questions 
                v ?= {}
                v = { value: v } unless isObject v
                v.name = q
                v
        else if typeof questions is 'string'
            multiple = false
            questions = [{name: questions, value: ''}]
        each(questions)
        .on 'item', (next, question) =>
            q = "#{question.name} "
            q += "[#{question.value}] " if question.value
            @shell.interface().question q, (answer) ->
                answers[question.name] = 
                    if answer is '' then question.value else answer
                next()
        .on 'end', ->
            answers = answers[questions[0].name] unless multiple
            return callback answers
