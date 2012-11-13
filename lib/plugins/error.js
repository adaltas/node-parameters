// Generated by CoffeeScript 1.4.0

module.exports = function(settings) {
  var shell;
  if (!settings.shell) {
    throw new Error('No shell provided');
  }
  shell = settings.shell;
  shell.on('error', function() {});
  return function(err, req, res, next) {
    var k, v;
    if (err.message) {
      res.red(err.message).ln();
    }
    if (err.stack) {
      res.red(err.stack).ln();
    }
    for (k in err) {
      v = err[k];
      if (k === 'message') {
        continue;
      }
      if (k === 'stack') {
        continue;
      }
      if (typeof v === 'function') {
        continue;
      }
      res.magenta(k).white(': ').red(v).ln();
    }
    return res.prompt();
  };
};