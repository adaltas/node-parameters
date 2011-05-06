
module.exports = function(options){
  // Validation
  if(!options.shell){
    throw new Error('No shell provided');
  }
  var shell = options.shell;
  return function error(err, req, res, next){
    res.red(err.message).ln();
    res.red(err.stack).ln();
    res.prompt();
  }
};

