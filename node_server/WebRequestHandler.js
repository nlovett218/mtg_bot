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
const fs = require('fs');
//const HandleConnection = Constants.HandleConnection; //require('./functions/handle/HandleConnection');
const MailHandler = require("../mail/MailHandler");
const KeyGenerator = require("./KeyGenerator");
//const routes = require("./routes");
var init = false;
var server = null;

//router.use(bodyParser.urlencoded({ extended: false }));
var port = normalizePort(process.env.PORT || '8080');
app.set('port', port);

const options = {
  key: fs.readFileSync('C:/Cert/_.magickingofthediscord.com_private_key.key'),
  cert: fs.readFileSync('C:/Cert/_.magickingofthediscord.com_private_key.pfx')
};

function CheckPostBody(paramArray)
{
	var validBody = true;

	paramArray.forEach(function(element) {
		if (element == null)
			validBody = false;
	})

	return validBody;
}

async function INSERT_KEY_TO_DATABASE(data)
{
	var now = Date.now();
	var CODE = data.KEY;
	var TIMESTAMP_CREATED = Constants.moment().format(Constants.momentTimeFormat);
	//var EXPIRES = Constants.moment(Constants.KEY_EXPIRE_TIME).format(Constants.momentTimeFormat);
	var EXPIRES = Constants.moment(now).add(Constants.KEY_EXPIRE_TIME, 'minutes').format(Constants.momentTimeFormat);//new Date(Constants.moment(timeSinceLastDraw).add(10, 'minutes').format("YYYY-MM-DD h:mm:ss"));
	var CUSTOMER_ID = data.CUSTOMER_ID;
	var PRODUCT_ID = data.PRODUCT_ID;
	var CUSTOMER_EMAIL = data.EMAIL;

	console.log(EXPIRES);
	//console.log(EXPIRES.toString());
	//var query_user = `INSERT INTO ${table_name_user} (mtg_userID, mtg_rankxp, mtg_health, mtg_wildcards, mtg_lastClaimDateTime, mtg_packs, mtg_dailyPackCooldown, mtg_weeklyPackCooldown, mtg_currency, mtg_lastCardDrawnDateTime, mtg_lastAttackDateTime, mtg_lastDeathDateTime, mtg_lastQuerySentDateTime, mtg_guilds, mtg_lastOptInOutDateTime, mtg_startingDeck, mtg_kills, mtg_deaths, mtg_damagedealt, mtg_amounthealed, mtg_reset) VALUES ('${userID}', '${rankxp}', '${health}', '${JSON.stringify(wildcards)}', NULL, '${packs}', NULL, NULL, '${currency}', STR_TO_DATE('${mtg_lastCardDrawnTime}','%m-%d-%Y %H:%i:%s'), NULL, NULL, STR_TO_DATE('${mtg_lastQuerySentDateTime}', '%m-%d-%Y %H:%i:%s'), '${JSON.stringify(mtg_guilds)}', NULL, '${mtg_startingDeck}', '${mtg_kills}', '${mtg_deaths}', '${mtg_damagedealt}', '${mtg_amounthealed}', '0');`;
	var insertDataQuery = `INSERT INTO ${Constants.PURCHASE_TABLE} (CODE, TIMESTAMP_CREATED, EXPIRES, CUSTOMER_ID, TIMESTAMP_REDEEMED, REDEEMER_USER_ID, PRODUCT_ID, CUSTOMER_EMAIL) VALUES ('${CODE}', STR_TO_DATE('${TIMESTAMP_CREATED}','%m-%d-%Y %H:%i:%s'), STR_TO_DATE('${EXPIRES}','%m-%d-%Y %H:%i:%s'), '${CUSTOMER_ID}', NULL, NULL, '${PRODUCT_ID}', '${CUSTOMER_EMAIL}')`;
  var insertDataResult = await Constants.HandleConnection.callDBFunction("MYSQL-fireAndForget", insertDataQuery);
}


Constants.WEB_SERVER.on('start', async function() 
{
	if (init) return;

	init = true;

	/*server = https.createServer(options, function (req, res) {
		res.writeHead(200);
  		res.end("hello world\n");
	}).listen(4433);*/

	//router.get("/");
	app.use(bodyParser.urlencoded({
	    extended:true
	}));

	app.use(express.json());

	app.route('/')
	  .get(function (req, res) {
	    res.send('MKOTD API')
	  })

	app.route('/purchase')
	  .get(function (req, res) {
	    res.send('INVALID PROTOCOL')
	  })
	  .post(async function (req, res) {

	  	if (req.body == null || req.body == undefined)
	  	{
	  		res.send("INVALID DATA");
	  	}

	  	let PostDataCheck = CheckPostBody([req.body["customerID"], req.body["type"], req.body["currency"], req.body["payment_intent"], req.body["line_items_ID"], 
	  		req.body["productID"], req.body["paid"], req.body["quantity"], req.body["isLiveMode"], req.body["email"]]);

	  	if (PostDataCheck) {

	    	res.send(`POSTED PURCHASE INFORMATION FOR CLIENT: ${req.body.customerID}`);
	    	//console.log("POST data");

	    	//var result = await HandleConnection.callDBFunction("MYSQL-fireAndForget", "INSERT INTO ")

	    	//console.log(KeyGenerator.generateKey());
	    	var KEYGEN = KeyGenerator.generateKey();

	    	var data = {
	    		KEY: KEYGEN,
	    		CUSTOMER_ID: req.body["customerID"],
	    		TYPE: req.body["type"],
	    		CURRENCY: req.body["currency"],
	    		PAYMENT_INTENT: req.body["payment_intent"],
	    		PRODUCT_ID: req.body["productID"],
	    		PAID: req.body["paid"],
	    		IS_LIVE: req.body["isLiveMode"],
	    		EMAIL: req.body["email"]
	    	};

	    	await INSERT_KEY_TO_DATABASE(data);
	    	await MailHandler.sendMail("Here is your product code", req.body.email, "onpurchase", data);
	    	return;
			}
	    //console.log(req);

	    res.send("INVALID DATA");
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
