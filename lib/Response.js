var Response, styles;
styles = require('./styles');
module.exports = Response = function(settings) {
  this.shell = settings.shell;
  return styles.apply(this, arguments);
};
Response.prototype.__proto__ = styles.prototype;
Response.prototype.prompt = function() {
  return this.shell.prompt();
};