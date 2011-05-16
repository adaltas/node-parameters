var styles = require('./styles');

var Response = function(settings){
    this.shell = settings.shell;
    styles.apply(this,arguments);
};

Response.prototype.__proto__ = styles.prototype;

Response.prototype.prompt = function(){
    return this.shell.prompt();
}

module.exports = Response;