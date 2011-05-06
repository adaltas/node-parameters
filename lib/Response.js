var styles = require('./styles');

var Response = function(options){
  this.shell = options.shell;
  styles.apply(this,arguments);
};

Response.prototype.__proto__ = styles.prototype;

Response.prototype.prompt = function(){
  return this.shell.prompt();
}

module.exports = Response;