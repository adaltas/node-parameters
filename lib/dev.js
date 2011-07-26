var app, shell;
process.chdir(__dirname + '/../');
shell = require('../index');
app = shell.Shell({
  project_dir: __dirname + '/../'
});
app.configure(function() {
  app.use(shell.history({
    shell: app
  }));
  app.use(shell.completer({
    shell: app
  }));
  app.use(shell.router({
    shell: app
  }));
  app.use(shell.cloud9({
    shell: app,
    ip: '127.0.0.1',
    port: '4102',
    detach: false
  }));
  app.use(shell.coffee({
    shell: app
  }));
  app.use(shell.help({
    shell: app,
    introduction: true
  }));
  return app.use(shell.error({
    shell: app
  }));
});