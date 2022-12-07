#!/usr/bin/env node

// Using reserved port `1783` to limit the risks of collision
// See https://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers

var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(1783, "127.0.0.1");
console.log('Server running at http://127.0.0.1:1783/');