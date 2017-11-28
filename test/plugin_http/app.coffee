
express = require('express')
app = module.exports = express()

app.get '/ping', (req, res) ->
  res.send 'pong'

app.listen 8834 if process.argv[1] is __filename

module.exports = app
