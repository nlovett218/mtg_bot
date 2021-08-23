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
//const app = express();
const bodyParser = require("body-parser")
var init = false;



router.post("/purchase", function(req, res) {
  /*var num1 = Number(req.body.num1);
  var num2 = Number(req.body.num2);
   
  var result = num1 + num2 ;
   
  res.send("Addition - " + result);*/
  console.log("Receiving new POST..");
  console.log(req);
  console.log(res);

  res.send("OK");
});

router.get('/purchase', function(req, res){
	res.send("Hello from the root application URL");
});
	 
/*app.listen(8080, function(){
  console.log("NODE WEB_SERVER is running on port 8080");
})*/

module.exports = router;
