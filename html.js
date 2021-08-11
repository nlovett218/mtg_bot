/*var http = require('http');
var express = require('express');
var app = express();
const LOG = require('./functions/util/LogAction');
const util = require('util');
const Constants = require('./functions/util/Constants');

// your express configuration here

var httpServer = null;

app.get('/', function (req, res) {
    res.header('Content-type', 'text/html');
    res.redirect('./html/index.html');
    //return res.end('<h1>Hello, Secure World!</h1>');
});

Constants.WEB_SERVER.on('start', function () {

	httpServer = http.createServer(app);

	httpServer.listen(8080);

	console.log("HTTP server listening on port 8080");
});*/