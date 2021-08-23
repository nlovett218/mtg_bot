//const BotInfo = require('./classes/BotInfo');
const LOG = require('../functions/util/LogAction');
const util = require('util');
const Constants = require('../functions/util/Constants');
const express = require("express");
const router = express.Router();
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
const http = require("http");
const https = require("https");
const app = express();
const bodyParser = require("body-parser");
//const routes = require("./routes");
var init = false;
var server = null;

//router.use(bodyParser.urlencoded({ extended: false }));
var port = normalizePort(process.env.PORT || '8080');
app.set('port', port);


Constants.WEB_SERVER.on('start', async function() 
{
	if (init) return;

	init = true;

	//server = https.createServer(app);

	//router.get("/");
	app.use(bodyParser.urlencoded({
	    extended:true
	}));

	app.use(express.json());
	app.route('/purchase')
	  .get(function (req, res) {
	    res.send('Get a random book')
	  })
	  .post(function (req, res) {
	    res.send('Add a book');
	    console.log("POST data");
	  })
	  .put(function (req, res) {
	    res.send('Update the book')
	  })

	app.listen(8080, function(){
	  console.log("NODE WEB_SERVER is running on port 8080");
	})

	/*app.get('/', function (req, res) {
		res.send("Test root");
	});

	app.get('/purchase', function (req, res) {
		res.send("Test purchase");
	});*/
});

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}
