//const BotInfo = require('./classes/BotInfo');
const LOG = require('./functions/util/LogAction');
const util = require('util');
const Constants = require('./functions/util/Constants');
const HandleConnection = require('./functions/handle/HandleConnection');
const HandleFunctionCall = require('./functions/HandleFunctionCall');


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
  console.log("Getting available images...");
  Constants.client.emit('refresh-images');
  console.log("Getting guild admins...");
  Constants.client.guilds.cache.map((guild) => {
    Constants.guildAdmins[guild.id] = [];
    Constants.guildAdmins[guild.id].push(guild.ownerID);
  });
  //console.log(Constants.imageFileLocations);
  //.attachFiles(['img1.png'])
  console.log("Our client is ready to go, awaiting first command...");
  //console.log(Constants.client.guilds);
  var channelObj = Constants.client.channels.cache.get(Constants.statusChannel);

  /*const botPermCheck = Constants.client.permissionsIn(channelObj);

  if (botPermCheck) //Constants.PermissionsManager.checkPermissionsForChannel(channelObj, channelObj.guild.me)
  {*/
    const statusChannel = channelObj;
    //Constants.client.guilds["510730001251958794"].channels["557911093066858496"]
    statusChannel.send(Constants.MessageCodes.BOT_ONLINE);
  //}
  //HandleFunctionCall.RegisterFunctions();

  console.log("Registering functions");
});

Constants.client.on('guildCreate', guild => {
  Constants.guildAdmins[guild.id] = [];
  Constants.guildAdmins[guild.id].push(guild.ownerID);
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

    if (Constants.PermissionsManager.checkPermissionsForChannel(channelObj, channelObj.guild.me))
    {
      const statusChannel = channelObj;
      //Constants.client.guilds["510730001251958794"].channels["557911093066858496"]
      statusChannel.send(Constants.MessageCodes.BOT_OFFLINE);
    }
  }
  catch (err)
  {

  }
  process.exit(0);
});


(async () => {
  var config = await Constants.readJSONFile(Constants.config_file);
  Constants.client.login(config.bot_token);
})();
