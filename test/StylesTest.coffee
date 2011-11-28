
assert = require 'assert'
shell = require('../index')
styles = shell.styles

class Writer
    data: ''
    write: (data) ->
        @data += data

module.exports =
    
    'Test colors # no style': (next) ->
        writer = new Writer
        styles( {stdout: writer} )
        .println('Test default')
        assert.eql writer.data, 'Test default\n'
        next()
        
    'Test colors # temporarily print bold then regular': (next) ->
        writer = new Writer
        styles( {stdout: writer} )
        .print('Test ').bold('bo').bold('ld').print(' or ').regular('reg').regular('ular').print(' and ').bold('bold').ln()
        assert.eql writer.data, '\u001b[39m\u001b[22mTest \u001b[39m\u001b[22m\u001b[39m\u001b[1mbo\u001b[39m\u001b[22m\u001b[39m\u001b[1mld\u001b[39m\u001b[22m\u001b[39m\u001b[22m or \u001b[39m\u001b[22m\u001b[39m\u001b[22mreg\u001b[39m\u001b[22mular\u001b[39m\u001b[22m and \u001b[39m\u001b[22m\u001b[39m\u001b[1mbold\u001b[39m\u001b[22m\n'
        next()
        
    'Test colors # definitely pass to bold': (next) ->
        writer = new Writer
        styles( {stdout: writer} )
        .print('Test ').bold().print('bo').print('ld').regular().print(' or ').print('reg').print('ular').print(' and ').bold().print('bo').print('ld').regular().ln()
        assert.eql writer.data, '\u001b[39m\u001b[22mTest \u001b[39m\u001b[22m\u001b[39m\u001b[1m\u001b[39m\u001b[1mbo\u001b[39m\u001b[1m\u001b[39m\u001b[1mld\u001b[39m\u001b[1m\u001b[39m\u001b[22m\u001b[39m\u001b[22m or \u001b[39m\u001b[22m\u001b[39m\u001b[22mreg\u001b[39m\u001b[22m\u001b[39m\u001b[22mular\u001b[39m\u001b[22m\u001b[39m\u001b[22m and \u001b[39m\u001b[22m\u001b[39m\u001b[1m\u001b[39m\u001b[1mbo\u001b[39m\u001b[1m\u001b[39m\u001b[1mld\u001b[39m\u001b[1m\u001b[39m\u001b[22m\n'
        next()
        
    'Test colors # temporary print green then blue': (next) ->
        writer = new Writer
        styles( {stdout: writer} )
        .print('Test ').green('gre').green('en').print(' or ').blue('bl').blue('ue').print(' and ').green('green').ln()
        assert.eql writer.data, '\u001b[39m\u001b[22mTest \u001b[39m\u001b[22m\u001b[32m\u001b[22mgre\u001b[39m\u001b[22m\u001b[32m\u001b[22men\u001b[39m\u001b[22m\u001b[39m\u001b[22m or \u001b[39m\u001b[22m\u001b[34m\u001b[22mbl\u001b[39m\u001b[22m\u001b[34m\u001b[22mue\u001b[39m\u001b[22m\u001b[39m\u001b[22m and \u001b[39m\u001b[22m\u001b[32m\u001b[22mgreen\u001b[39m\u001b[22m\n'
        next()
        
    'Test colors # definitely pass to green': (next) ->
        writer = new Writer
        styles( {stdout: writer} )
        .print('Test ').green().print('gre').print('en').nocolor(' or ').blue().print('bl').print('ue').nocolor(' and ').green().print('gre').print('en').ln()
        .reset()
        assert.eql writer.data, '\u001b[39m\u001b[22mTest \u001b[39m\u001b[22m\u001b[32m\u001b[22m\u001b[32m\u001b[22mgre\u001b[32m\u001b[22m\u001b[32m\u001b[22m\u001b[32m\u001b[22men\u001b[32m\u001b[22m\u001b[32m\u001b[22m\u001b[39m\u001b[22m or \u001b[32m\u001b[22m\u001b[32m\u001b[22m\u001b[34m\u001b[22m\u001b[34m\u001b[22mbl\u001b[34m\u001b[22m\u001b[34m\u001b[22m\u001b[34m\u001b[22mue\u001b[34m\u001b[22m\u001b[34m\u001b[22m\u001b[39m\u001b[22m and \u001b[34m\u001b[22m\u001b[34m\u001b[22m\u001b[32m\u001b[22m\u001b[32m\u001b[22mgre\u001b[32m\u001b[22m\u001b[32m\u001b[22m\u001b[32m\u001b[22men\u001b[32m\u001b[22m\u001b[32m\u001b[22m\n\u001b[39m\u001b[22m'
        next()
