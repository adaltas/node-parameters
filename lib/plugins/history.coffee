
fs = require 'fs'
path = require 'path'
crypto = require 'crypto'
Interface = require('readline').Interface

hash = (value) -> crypto.createHash('md5').update(value).digest('hex')

module.exports = (settings) ->
    # Validation
    throw new Error 'No shell provided' if not settings.shell
    shell = settings.shell
    # Only in shell mode
    return if not settings.shell.isShell
    # Persist readline history
    settings.dir ?= "#{process.env['HOME']}/.node_shell"
    settings.name ?= hash process.argv[1]
    file ?= "#{settings.dir}/#{settings.file}"
    # Create store directory
    fs.mkdirSync settings.dir, 0700 unless path.existsSync settings.dir
    # Look for previous history
    if path.existsSync file
        try
            json = fs.readFileSync(file, 'utf8') or '[]'
            settings.shell.interface().history = JSON.parse json
        catch e
            settings.shell.styles.red('Corrupted history file').ln()
    # Write new history
    stream = fs.createWriteStream file, {flag: 'w'}
    Interface.prototype._addHistory = ((parent) -> ->
        if @history.length
            buffer = new Buffer JSON.stringify( @history )
            fs.write stream.fd, buffer, 0, buffer.length, 0
        parent.apply @, arguments
    ) Interface.prototype._addHistory
    null
    
