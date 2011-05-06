
var cluster = require('cluster'),
  app = require('./app');

cluster(app)
.set('workers', 1)
.set('socket path', __dirname+'/../tmp')
.use(cluster.reload(['./']))
.use(cluster.logger('../logs'))
.use(cluster.stats())
.use(cluster.pidfiles('../tmp'))
.use(cluster.cli())
.use(cluster.repl(8888))
.use(cluster.debug())
.listen(3000);
