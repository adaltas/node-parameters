module.exports = function(settings) {
  var shell;
  if (!settings.shell) {
    throw new Error('No shell provided');
  }
  shell = settings.shell;
  return function(err, req, res, next) {
    res.red(err.message).ln();
    res.red(err.stack).ln();
    return res.prompt();
  };
};