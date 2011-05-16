
var express = require('express'),
    RedisStore = require('connect-redis');

var app = module.exports = express.createServer();

app.configure(function(){
        app.use(express.favicon());
        app.use(express.methodOverride());
        app.use(express.bodyParser());
        app.use(express.cookieParser());
        app.use(express.session({secret:'my key', store: new RedisStore({ maxAge: 30*60*1000 })}));
        app.use(app.router);
        app.use(express.errorHandler({ showStack: true, dumpExceptions: true }));
});

app.get('/', function(req, res, next){
    res.send('Welcome');
});