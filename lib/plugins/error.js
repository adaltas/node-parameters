
module.exports = function(settings){
    // Validation
    if(!settings.shell){
        throw new Error('No shell provided');
    }
    var shell = settings.shell;
    return function error(err, req, res, next){
        res.red(err.message).ln();
        res.red(err.stack).ln();
        res.prompt();
    }
};

