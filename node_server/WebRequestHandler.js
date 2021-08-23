//const BotInfo = require('./classes/BotInfo');
const LOG = require('../functions/util/LogAction');
const util = require('util');
const Constants = require('../functions/util/Constants');
const express = require("express");
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
const http = require("http");
const app = express();
const bodyParser = require("body-parser")
var init = false;

app.use(bodyParser.urlencoded({
    extended:true
}));
 

Constants.WEB_SERVER.on('start', async function() 
{
	if (init) return;

	init = true;

	app.post("/purchase", function(req, res) {
	  /*var num1 = Number(req.body.num1);
	  var num2 = Number(req.body.num2);
	   
	  var result = num1 + num2 ;
	   
	  res.send("Addition - " + result);*/
	  console.log("Receiving new POST..");
	  console.log(req);
	  console.log(res);
	});
	 
	app.listen(443, function(){
	  console.log("NODE WEB_SERVER is running on port 443");
	})
});

