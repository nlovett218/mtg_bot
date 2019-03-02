class BotInfo {
  constructor(name, version, author, cmdPrefix)
  {
    this.processName = name;
    this.processVersion = version;
    this.processAuthor = author;
    this.commandPrefix = cmdPrefix;

    this.verbose = true;
    this.debug = true;
  }

  name() { return this.processName; }

  version() { return this.processVersion; }

  author() { return this.processAuthor; }

  prefix() { return this.commandPrefix; }

  logBotInfo() {
    console.log(this.processName + " is running version " + this.processVersion + "| Created by " + this.processAuthor);
  }
}

var _BotInfo = new BotInfo("Magic the Gathering BOT", "0.0.15", "suff0cati0n", "m!");
_BotInfo.logBotInfo();

const fs = require('fs');
const events = require('events');
const MYSQL = require('mysql');
const ADODB = require('node-adodb');

var mdb = new events.EventEmitter();
var sql = new events.EventEmitter();
var user = new events.EventEmitter();

var cmdPrefix = _BotInfo.prefix();
var isDatabaseAvailable = false;
var isMYSQLAvailable = false;
var mdbPath = "MTG BOT IDS.mdb";
var connection;

var mysql_connection_pool      =    MYSQL.createPool({
    connectionLimit : 100, //important
    host     : 'localhost',
    user     : 'mtg_bot',
    password : 'Clovett84',
    database : 'mtg_db',
    debug    :  false
});

var commandList = [
  help,
  draw
];

const Discord = require('discord.js');
const client = new Discord.Client();
const token = "NTUwMTE0OTQ2MjAxOTQ0MDc0.D1duag.D1yrE60RPAyM2wnoE5LQ5GQTCvY";

console.log("Checking read access for " + mdbPath);
fs.access(mdbPath, fs.constants.R_OK, (err) => {
  console.log(`${mdbPath} ${err ? 'is not readable' : 'is readable'}`);

  if (!err)
  {
    isDatabaseAvailable = true;
    mdb.emit('read')
  }
});

mdb.on('read', function() {
    try {
      connection = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=' + mdbPath + ';');
      console.log("Successfully opened a .mdb connection...");
    } catch (e) {
      console.log(e.message);
    } finally {
      console.log("Starting MYSQL connection process...");
      sql.emit('start-connection-test');
    }
});

mdb.on('query', query => {
    connection
      .query(query)
      .then(data => {
          console.log(JSON.stringify(data, null, 2));
      })
      .catch(error => {
          console.error(error);
      });
});


client.on('ready', () => {
  mdb.on('mysql-success', function() {
    console.log("Our client is ready to go, awaiting first command...")
  });
});

client.on('message', msg => {
    //if (!isDatabaseAvailable || !isMYSQLAvailable)
      //return;

    if (msg.author.id != client.user.id) {
        if (String(msg).startsWith(cmdPrefix, 0))
          user.emit('processusercommand', msg);
    }
});

user.on('processusercommand', cmd => {
  var args = String(cmd).split(" ");
  var exclamationIndexIdentifier = String(cmd).indexOf("!");
  var endCommandIndex = String(cmd).indexOf(" ");
  var commandSubstring = String(cmd).substring(exclamationIndexIdentifier + 1, endCommandIndex > -1 ? endCommandIndex : String(cmd).length);
  //var stringLiteral = String(cmd);
  var matchIndex = -1;

  for (let key of commandList) {
    if (key.name == commandSubstring)
    {
      matchIndex = commandList.indexOf(key);
      break;
    }
    //console.log(key); // expected output: 0 1 2
  }

  if (matchIndex < 0)
  {
    sendChannelMessage(cmd, "<@" + cmd.author.id + "> please check your command syntax!");
    console.log("Function match not found for " + commandSubstring);
    return;
  }

  commandList[matchIndex](args);
});

sql.on('start-connection-test', function() {
      mysql_connection_pool.query("SELECT * FROM mtg_user", function(err,rows){
        if(err) {
            console.log(err);
        }
        else {
            console.log("MYSQL Connection Successful!");
        }
      });
});

sql.on('fire-and-forget-query', query => {
  mysql_connection_pool.query(query, function(err, result)
  {
    if (err)
      console.log(err);
    else
      console.log("Sent \'" + query + "\' to the database.")
  });
});

function MAKE_DB_CALL(query)
{
  result = null;
  mysql_connection_pool.query(query, function(err, rows)
  {
    if (err)
      console.log(err);
    else {
      console.log("Sent \'" + query + "\' to the database and received a response.");
      result = rows;
    }
  });

  return result;
}

function sendChannelMessage(msg_obj, msg)
{
  msg_obj.channel.send(msg);
}

function help(args)
{
  console.log("help ran");
}

function draw(args)
{
  console.log("draw ran");
}

client.login(token);
