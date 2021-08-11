//const BotInfo = require('./classes/BotInfo');
const LOG = require('./functions/util/LogAction');
const util = require('util');
const Constants = require('./functions/util/Constants');
const HandleConnection = require('./functions/handle/HandleConnection');
const HandleFunctionCall = require('./functions/HandleFunctionCall');
//const repeating = require('repeating');
const Topgg = require("@top-gg/sdk");
const express = require("express");
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
const http = require("http");
const html = require("./html.js");
const app = express();

const webhook = new Topgg.Webhook(Constants.bot_webhook_authorization);

var listenServerInit = false;

Constants.BotInfo.logBotInfo();

//var isDatabaseAvailable = false;
//var isMYSQLAvailable = false;


//This is where the start of our bot begins
Constants.client.on('ready', async () => {

    Constants.HandleConnection = await require('./functions/handle/HandleConnection');
    Constants.MDB.emit('check-file');
});

Constants.client.on('disconnect', async function() {
  //var guildID
  //var getChannels = await HandleConnection.callDBFunction(`MYSQL-returnQuery`, `SELECT * FROM mtg_discord_servers WHERE mtg_guildID='${guildID}'`);
  try {
    var channelObj = Constants.client.channels.cache.get(Constants.statusChannel);
    /*const botPermCheck = guild.me.permissionsIn(channelObj);

    if (botPermCheck) //Constants.PermissionsManager.checkPermissionsForChannel(channelObj, channelObj.guild.me)
    {*/
      const statusChannel = channelObj;
      //Constants.client.guilds["510730001251958794"].channels["557911093066858496"]
      statusChannel.send(Constants.MessageCodes.BOT_OFFLINE);
    //}
  }
  catch(err)
  {
    console.log(err);
  }
});

Constants.MDB.on('success', async function()
{
  Constants.cards = await HandleConnection.callDBFunction("ADODB-returnQuery", "SELECT * FROM cards");
  Constants.lands = await HandleConnection.callDBFunction("ADODB-returnQuery", "SELECT * FROM lands");

  Constants.SQL.emit('test-sql-connection');
});

Constants.SQL.on('success', async function() {
  console.log("Setting permanent type checkers...");
  Constants.client.emit('set-permanent-types');
  console.log("Getting available images...");
  Constants.client.emit('refresh-images');
  console.log("Getting guild admins...");
  Constants.client.guilds.cache.map((guild) => {
    Constants.guildAdmins[guild.id] = [];
    Constants.guildAdmins[guild.id].push(guild.ownerID);
  });

  Constants.client.emit('updateBotActivity');
  setInterval(function() { Constants.client.emit('updateBotActivity'); }, 600000);
  //console.log(Constants.imageFileLocations);
  //.attachFiles(['img1.png'])
  console.log("Our client is ready to go, awaiting first command...");
  //console.log(Constants.client.guilds);
  var channelObj = Constants.client.channels.cache.get(Constants.statusChannel);

  /*const botPermCheck = Constants.client.permissionsIn(channelObj);

  if (botPermCheck) //Constants.PermissionsManager.checkPermissionsForChannel(channelObj, channelObj.guild.me)
  {*/
  if (Constants.PermissionsManager.checkPermissionsForChannel(channelObj, channelObj.guild.me)) {
    const statusChannel = channelObj;
    //Constants.client.guilds["510730001251958794"].channels["557911093066858496"]
    statusChannel.send(Constants.MessageCodes.BOT_ONLINE);
  }
  //HandleFunctionCall.RegisterFunctions();

  console.log("Registering functions");

  console.log("Initiating listen server");
  Constants.client.emit('initiate-listen-server');

  console.log("Initiating web server");
  Constants.WEB_SERVER.emit('start');

  //Constants.triggerEvent("201841156990959616", null, null, "onCardDraw", null, null, null);
});

Constants.client.on('set-permanent-types', () => {
  Constants.specialPermanentTypes["non_land"].checker = Constants._TypeValidation.isNonLandCard;
  Constants.specialPermanentTypes["creature"].checker = Constants._TypeValidation.isCreature;
  Constants.specialPermanentTypes["equipped_creature"].checker = Constants._TypeValidation.isEquippedCreature;
  Constants.specialPermanentTypes["tapped_creature"].checker = Constants._TypeValidation.isTappedCreature;
  Constants.specialPermanentTypes["untapped_creature"].checker = Constants._TypeValidation.isUntappedCreature;
  Constants.specialPermanentTypes["spells"].checker = Constants._TypeValidation.isInstantOrSorcerySpell;
  Constants.specialPermanentTypes["enchantment"].checker = Constants._TypeValidation.isEnchantment;
  Constants.specialPermanentTypes["land"].checker = Constants._TypeValidation.isLand;
  Constants.specialPermanentTypes["tapped_land"].checker = Constants._TypeValidation.isTappedLand;
  Constants.specialPermanentTypes["untapped_land"].checker = Constants._TypeValidation.isUntappedLand;
});

Constants.client.on('guildCreate', guild => {
  Constants.guildAdmins[guild.id] = [];
  Constants.guildAdmins[guild.id].push(guild.ownerID);
});

Constants.client.on('updateBotActivity', async function() {

    //var playerCount = `${Constants.client.guilds.cache.map((guild) => guild.memberCount).reduce((p, c) => p + c)}`;
    var playerCountResult = await HandleConnection.callDBFunction("MYSQL-returnQuery", "SELECT COUNT(*) FROM mtg_user");

    if (playerCountResult[0] == undefined || playerCountResult[0] == null)
      return;

    //console.log(playerCountResult[0]);

    var playerCount = playerCountResult[0]['']['COUNT(*)'];

    //console.log(playerCount);

    Constants.client.user.setActivity(`over ${Constants.client.guilds.cache.size} servers / ${playerCount} players`, {
      type: "WATCHING",
    });
});


Constants.client.on('refresh-images', async function(){
  Constants.imageFileLocations = {};
  var files = await Constants.FILE_SYSTEM.readdirSync(Constants.imageDir);
  for (fileIndex = 0; fileIndex < files.length; fileIndex++)
  {
    var fileNameStr = files[fileIndex];
    Constants.imageFileLocations[fileNameStr] = `${Constants.imageDir}${fileNameStr}`;
  }
});

Constants.client.on('initiate-listen-server', async function() {

  if (listenServerInit)
     return;

  listenServerInit = true;

  app.post("/dblwebhook", webhook.listener(async (vote) => {
    // vote will be your vote object, e.g
    //console.log("We got a vote!");
    console.log(`New vote: ${vote.user}`); // 395526710101278721 < user who voted\

    var returnRewards = await Constants.awardVoteReward(vote.user, vote.isWeekend);

    //console.log("rewards: " + returnRewards);

    if (returnRewards != null & returnRewards != undefined) {

      if (returnRewards.cards != null && returnRewards.cards != undefined)
        Constants.sendDirectMessage(vote.user, Constants.voteRewardString, returnRewards.cards);
  }

    // You can also throw an error to the listener callback in order to resend the webhook after a few seconds
  }));

  app.listen(3000, function(err){
    if (err) console.log("Error in server setup")
    console.log(`Server listening on Port 3000`);
  });

  //console.log("App listening on port 3000");
});

/*Constants.client.on('initiate-listen-server', async function() {

  //if (listenServerInit)
     //return;

  //listenServerInit = true;
  const host = 'localhost';
  const port = 3000;

  const requestListener = function (req, res) {};

  const server = http.createServer(requestListener);

  server.listen(port, host, () => {
      console.log(`Server is running on http://${host}:${port}`);
  });


  app.post("/test", webhook.listener(async (data) => {
    // vote will be your vote object, e.g
    //console.log("We got a vote!");
    console.log(`Webhook test`); // 395526710101278721 < user who voted\
  }));

  const APIURL = `http://localhost:3000/test`;

  const params = new URLSearchParams();
  params.append('test', '123');
  
  //const data = `_user_id=${userId}&_api_key=${apiKey}&url=${url}`

  var short_url = null;

  var short = await fetch(`${APIURL}`, {method: 'POST', body: params})
  //.then(res => res.json())
  .then(json => {
    console.log(json);
    //short_url = json.shortenedUrl;
  });

  //console.log("App listening on port 3000");

});*/


/*process.on('SIGTERM', () => {
  console.log('SIGTERM signal received.');

});*/

process.on('uncaughtException', (err) => {
    const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, 'g'), './');
    console.error('Uncaught Exception: ', errorMsg);
    Constants.commandRequests = [];
    // process.exit(1); //Eh, should be fine, but maybe handle this?
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
  console.error(origin);
  console.error(err);
  Constants.commandRequests = [];
});

process.on('unhandledRejection', err => {
    console.error('Uncaught Promise Error: ', err);
    Constants.commandRequests = [];
    // process.exit(1); //Eh, should be fine, but maybe handle this?
});

process.on('SIGINT', async err => {

  try {
    var channelObj = Constants.client.channels.cache.get(Constants.statusChannel);

    //console.log(channelObj);

    //if (Constants.PermissionsManager.checkPermissionsForChannel(channelObj, channelObj.guild.me))
    if (Constants.PermissionsManager.checkPermissionsForChannel(channelObj, channelObj.guild.me)) {
      const statusChannel = channelObj;
      //Constants.client.guilds["510730001251958794"].channels["557911093066858496"]
      await statusChannel.send(Constants.MessageCodes.BOT_OFFLINE);
    }
  }
  catch (err)
  {
    console.log(err);
  }

  process.exit(0);
});


(async () => {
  var config = await Constants.readJSONFile(Constants.config_file);
  Constants.client.login(config.bot_token);
})();
