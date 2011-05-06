var sys = require('sys'),
  styles = require('../index').styles;

styles()
.println('Test default')

// Temporary print bold then regular
.print('Test ').bold('bo').bold('ld').print(' or ').regular('reg').regular('ular').print(' and ').bold('bold').ln()
// Definitely pass to bold
.print('Test ').bold().print('bo').print('ld').regular().print(' or ').print('reg').print('ular').print(' and ').bold().print('bo').print('ld').regular().ln()

// Temporary print green then blue
.print('Test ').green('gre').green('en').print(' or ').blue('bl').blue('ue').print(' and ').green('green').ln()
// Definitely pass to bold
.print('Test ').green().print('gre').print('en').nocolor(' or ').blue().print('bl').print('ue').nocolor(' and ').green().print('gre').print('en').ln()

.reset();
