
    
module.exports = function(req, res, next){
    if(!req.shell.isShell){
        return res.red('Command may only be executed inside a running shell'), prompt();
    }
    next();
}