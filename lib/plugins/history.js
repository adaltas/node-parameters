var Interface, crypto, fs, path;
fs = require('fs');
path = require('path');
crypto = require('crypto');
Interface = require('readline').Interface;
module.exports = function(settings) {
  var createDir, historyStream, _ref;
  if (!settings.shell) {
    throw new Error('No shell provided');
  }
  if (!settings.shell.isShell) {
    return;
  }
  createDir = !settings.historyFile && !path.existsSync(process.env['HOME'] + '/.node_shell');
  if (createDir) {
    fs.mkdirSync(process.env['HOME'] + '/.node_shell', 0700);
  }
    if ((_ref = settings.historyFile) != null) {
    _ref;
  } else {
    settings.historyFile = process.env['HOME'] + '/.node_shell/' + crypto.createHash('md5').update(settings.shell.project_dir).digest('hex');
  };
  if (path.existsSync(settings.historyFile)) {
    try {
      settings.shell.interface.history = JSON.parse(fs.readFileSync(settings.historyFile, 'utf8'));
    } catch (e) {
      settings.shell.styles.red('Corrupted history file').ln();
    }
  }
  historyStream = fs.createWriteStream(settings.historyFile, {
    flag: 'w'
  });
  Interface.prototype._addHistory = (function(parent) {
    return function() {
      var buffer;
      if (this.history.length) {
        buffer = new Buffer(JSON.stringify(this.history));
        fs.write(historyStream.fd, buffer, 0, buffer.length, 0);
      }
      return parent.apply(this, arguments);
    };
  })(Interface.prototype._addHistory);
  return null;
};