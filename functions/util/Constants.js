const BotInfo = require('../../classes/BotInfo');
const Events = require('events');
const MYSQL = require('mysql');
const Discord = require('discord.js');
const { Permissions } = require('discord.js');
const path = require('path');
const FILE_SYSTEM = require('fs');

var local = {
  permissionsFlags:new Permissions([
  	'SEND_MESSAGES',
  	'EMBED_LINKS',
  	'ATTACH_FILES',
    'ADD_REACTIONS',
    'VIEW_CHANNEL',
    'USE_EXTERNAL_EMOJIS',
  	'READ_MESSAGE_HISTORY',
  	'MANAGE_ROLES',
  ]),
  PermissionsManager:require('./PermissionsManager'),
  Discord:require('discord.js'),
  moment:require('moment'),
  Canvas:require('canvas'),
  snekfetch:require('snekfetch'),
  HandleConnection:null, //will be initialized after starting
  FILE_SYSTEM:require('fs'),
  channels_data_file: './channels-data.json',
  BotInfo:new BotInfo("Magic: King of the Discord", "0.73.4.22", "suff0cati0n", "m!"),
  client:new Discord.Client(),
  config_file:'./config.json',
  mdbPath:"db/MTG BOT IDS.mdb",
  momentTimeFormat: 'MM-DD-YYYY HH:mm:ss',
  guildPrefix: "GUILD_",
  statusChannel: "809224743320289292",
    //"809224743320289292" Magic: KotD discord
    //869449234695483456 Test Server
  botOwnerID: '201841156990959616', //201841156990959616
  maximumHandSize: 7,
  maximumBattlefieldSize: {
    "creature": 10,
    "enchantment - aura": 10,
    "enchantment": 10
  },
  fieldIDLength: 14,
  gemPercentageReceived: 20,
  baseCurrencyWinAmount: 50,
  packCost: 700,
  maxAllowedRedeemPacks: 3,
  maxAllowedPurchasePacks: 3,
  baseXPWinAmount: 10,
  cardStealAmount: 3,
  startingLandAmount: 24,
  startingCardAmount: 40,
  attackCooldown: 15,
  drawCooldown: 3,
  claimCooldown: 44640,
  dailyCooldown: 1440,
  weeklyCooldown: 10080,
  commandCooldownTime: 500,

  baseDailyPackAward: 2,
  extraDailyPackAward: 3,
  baseWeeklyPackAward: 3,
  extraWeeklyPackAward: 4,

  packAmounts: {
    guaranteed_lands: 2,
    guaranteed_commons: 2,
    guaranteed_uncommons: 2,
    guaranteed_rare_mythic: 1
  },

  reactionTimes: {
    declareCreatures: 20000,
    begin: 40000,
    redeemWildcard: 12000,
    optInOut: 10000,
    discard: 30000,
    openPack: 10000,
    purchasePack: 20000,
    buyPack: 10000,
    chooseTarget: 20000,
  },

  SQL:new Events.EventEmitter(),
  MDB:new Events.EventEmitter(),
  USER:new Events.EventEmitter(),
  SERVER:new Events.EventEmitter(),
  cards:null,
  lands:null,
  mysql_connection_pool:MYSQL.createPool({
      connectionLimit : 100, //important
      host     : 'localhost',
      user     : 'mtg_bot',
      password : 'Clovett84##',
      database : 'mtg_db',
      debug    :  false
  }),

  commandRequests: [

  ],

  imageDir: './Images/',
  templateCardFileName: 'black_template.jpg',
  imageFileExtension: '.png',
  imageFileLocations: {

  },

  botAdmins: [
    '201841156990959616', //youviolateme
    //201841156990959616
  ],

  guildAdmins: {

  },

  emoji_id: {
      white: '831059754075947049',       //04-12-2021
      black: '831059685771575296',       //04-12-2021
      green: '831059719665745930',       //04-12-2021
      red: '831059737310396426',        //04-12-2021
      blue: '831059702996533318',        //04-12-2021
      currency: '831078729638871080',    //04-12-2021
      sword: '⚔',
      shield: '🛡',
      yes_mark: '✅',
      no_mark: '🚫',
      optedin: '831077386623254548',
      optedout: '831077396349452348',
      bronze: '831077309845864448',
      silver: '831077428121436210',
      gold: '831077349172183044',
      platinum: '831077417052930078',
      diamond: '831077323545247774',
      exp: '831077295816966176',
      balloon: '🎈',
      heart: '♥',
      kill: '831077361176150017',        //556654125144735744
      death: '☠',
      clock: '⏰',
      wildcard: '831077458827542548',    //556665538181464065
      pack: '831077408060604416',        //556666333501194240
      doton: '831077338992476170',
      dotoff: '831077331900301312',      //558087733747122186
      common: '831059903257903134',     //04-12-2021
      uncommon: '831059879983841291',   //04-12-2021
      rare: '831059869738074154',       //04-12-2021
      mythic: '831059862251241472',     //04-12-2021
      tapped: '831077442579857412'      //558968431169241119

  },

  emoji_letters:[
    "🇦",
    "🇧",
    "🇨",
    "🇩",
    "🇪",
    "🇫",
    "🇬",
    "🇭",
    "🇮",
    "🇯",
    "🇰",
    "🇱",
    "🇲",
    "🇳",
    "🇴",
    "🇵",
    "🇶",
    "🇷",
    "🇸",
    "🇹",
    "🇺",
    "🇻",
    "🇼",
    "🇽",
    "🇾",
    "🇿"
  ],

  color_codes: {
    white: "#FFFFFF",
    black: "#000000",
    green: "#008000",
    red: "#FF0000",
    blue: "#0000FF"
  },

  patreon_upgrades: {
    "tier1": [{
      extraPacks: 0,
      earlyCards: false,
      roleId: '833405997199786005'
    }],
    "tier2": [{
      extraPacks: 1,
      earlyCards: false,
      roleId: '869028435283034163'
    }],
    "tier3": [{
      extraPacks: 3,
      earlyCards: false,
      roleId: '869028470821355550'
    }],
    "tier4": [{
      extraPacks: 10,
      earlyCards: false,
      roleId: '869028503650185236'
    }],
    "tier5": [{
      extraPacks: 30,
      earlyCards: true,
      roleId: '869028536730652732'
    }],
    "tier6": [{
      extraPacks: 30,
      earlyCards: true,
      roleId: '869028671334273025'
    }],
    "tier7": [{
      extraPacks: 30,
      earlyCards: true,
      roleId: '869030006548996147'
    }],
    "tier8": [{
      extraPacks: 30,
      earlyCards: true,
      roleId: '869030068670840832'
    }],
  },

  xp_levels: {
    "Bronze": [
      {
          minXP: 0,
          maxXP: 25,
          tier: 1,
          tierText: "I",
          emoji_id: `<:bronze:831077309845864448>`
      },
      {
          minXP: 26,
          maxXP: 50,
          tier: 2,
          tierText: "II",
          emoji_id: `<:bronze:831077309845864448>`
      },
      {
          minXP: 51,
          maxXP: 78,
          tier: 3,
          tierText: "III",
          emoji_id: `<:bronze:831077309845864448>`
      },
      {
          minXP: 79,
          maxXP: 124,
          tier: 4,
          tierText: "IV",
          emoji_id: `<:bronze:831077309845864448>`
      },
      {
          minXP: 125,
          maxXP: 212,
          tier: 5,
          tierText: "V",
          emoji_id: `<:bronze:831077309845864448>`
      },
      {
          minXP: 213,
          maxXP: 345,
          tier: 6,
          tierText: "VI",
          emoji_id: `<:bronze:831077309845864448>`
      }
    ],
    "Silver": [
      {
          minXP: 346,
          maxXP: 540,
          tier: 1,
          tierText: "I",
          emoji_id: `<:silver:831077428121436210>`
      },
      {
          minXP: 541,
          maxXP: 760,
          tier: 2,
          tierText: "II",
          emoji_id: `<:silver:831077428121436210>`
      },
      {
          minXP: 761,
          maxXP: 990,
          tier: 3,
          tierText: "III",
          emoji_id: `<:silver:831077428121436210>`
      },
      {
          minXP: 991,
          maxXP: 1368,
          tier: 4,
          tierText: "IV",
          emoji_id: `<:silver:831077428121436210>`
      },
      {
          minXP: 1369,
          maxXP: 1765,
          tier: 5,
          tierText: "V",
          emoji_id: `<:silver:831077428121436210>`
      },
      {
          minXP: 1766,
          maxXP: 2290,
          tier: 6,
          tierText: "VI",
          emoji_id: `<:silver:831077428121436210>`
      }
    ],
    "Gold": [
      {
          minXP: 2291,
          maxXP: 2754,
          tier: 1,
          tierText: "I",
          emoji_id: `<:gold:831077349172183044>`
      },
      {
          minXP: 2755,
          maxXP: 3560,
          tier: 2,
          tierText: "II",
          emoji_id: `<:gold:831077349172183044>`
      },
      {
          minXP: 3561,
          maxXP: 4521,
          tier: 3,
          tierText: "III",
          emoji_id: `<:gold:831077349172183044>`
      },
      {
          minXP: 4522,
          maxXP: 5690,
          tier: 4,
          tierText: "IV",
          emoji_id: `<:gold:831077349172183044>`
      },
      {
          minXP: 5691,
          maxXP: 6950,
          tier: 5,
          tierText: "V",
          emoji_id: `<:gold:831077349172183044>`
      },
      {
          minXP: 6951,
          maxXP: 8300,
          tier: 6,
          tierText: "VI",
          emoji_id: `<:gold:831077349172183044>`
      }
    ],
    "Platinum": [
      {
          minXP: 8301,
          maxXP: 9723,
          tier: 1,
          tierText: "I",
          emoji_id: `<:platinum:831077417052930078>`
      },
      {
          minXP: 9724,
          maxXP: 11145,
          tier: 2,
          tierText: "II",
          emoji_id: `<:platinum:831077417052930078>`
      },
      {
          minXP: 11146,
          maxXP: 13787,
          tier: 3,
          tierText: "III",
          emoji_id: `<:platinum:831077417052930078>`
      },
      {
          minXP: 13788,
          maxXP: 16450,
          tier: 4,
          tierText: "IV",
          emoji_id: `<:platinum:831077417052930078>`
      },
      {
          minXP: 16451,
          maxXP: 19925,
          tier: 5,
          tierText: "V",
          emoji_id: `<:platinum:831077417052930078>`
      },
      {
          minXP: 19926,
          maxXP: 25000,
          tier: 6,
          tierText: "VI",
          emoji_id: `<:platinum:831077417052930078>>`
      }
    ],
    //"diamond": [],
    //"mythic": [],
    //"legendary": [],
    //"champion": []
  },

  MessageCodes: {
      MYSQL_no_connection: "ERROR: A connection to the mysql database could not be established.",
      MYSQL_query_unsuccessful: "ERROR: MYSQL query could not be executed, reason unknown.",
      MYSQL_user_not_found: "ERROR: Query could not be executed, user doesn't have any data to query.",
      ADODB_file_not_found: "ERROR: A connection to the .mdb could not be established because the file doesn't exist. Please check the file path.",
      ADODB_no_connection: "ERROR: A connection to the .mdb database has not been established. Please contact the server administrator.",
      ADODB_query_unsuccessful: "ERROR: ADODB query could not be executed, reason unknown.",
      INVALID_discord_token: "ERROR: You have provided an invalid discord token.",
      STRING_too_long: "ERROR: String is too long. If sending a discord message, please shorten to less than 2000 characters.",
      EMOJI_not_found: "ERROR: Specified emoji was not found.",
      USER_exists: "our wizards have determined you already started playing.",
      BOT_OFFLINE: `<:dotoff:831077331900301312> Bot is going offline...`,
      BOT_ONLINE: `<:doton:831077338992476170> Bot is coming online...`,
      USER_TASK_EXISTS: `Unable to perform command at this time.`,

  },

  getManaString:function(mana)
  {
    var mana_string = "";

    var white = mana["white"];
    var black = mana["black"];
    var green = mana["green"];
    var red = mana["red"];
    var blue = mana["blue"];

    for (w = 0; w < white; w++)
      mana_string += local.returnSingleManaByColor("white");
      for (bla = 0; bla < black; bla++)
        mana_string += local.returnSingleManaByColor("black");
        for (g = 0; g < green; g++)
          mana_string += local.returnSingleManaByColor("green");
          for (r = 0; r < red; r++)
            mana_string += local.returnSingleManaByColor("red");
            for (blu = 0; blu < blue; blu++)
              mana_string += local.returnSingleManaByColor("blue");

    //console.log(mana_string);

    return mana_string;
  },

  returnSingleManaByColor:function(color)
  {
    //console.log(color);

    return `<:${color}:${local.emoji_id[color]}>`;
  },

  returnManaByColorTable:function(colorFromDB)
  {
    //console.log(color);
    var colorJSON = JSON.parse(colorFromDB);

    var colorTableString = ``;

    var colorTable = colorJSON.colors;

    var white = colorTable["white"];
    var black = colorTable["black"];
    var green = colorTable["green"];
    var red = colorTable["red"];
    var blue = colorTable["blue"];

    for (w = 0; w < white; w++)
      colorTableString += local.returnSingleManaByColor("white");
      for (bla = 0; bla < black; bla++)
        colorTableString += local.returnSingleManaByColor("black");
        for (g = 0; g < green; g++)
          colorTableString += local.returnSingleManaByColor("green");
          for (r = 0; r < red; r++)
            colorTableString += local.returnSingleManaByColor("red");
            for (blu = 0; blu < blue; blu++)
              colorTableString += local.returnSingleManaByColor("blue");

    //return `<:${color}:${local.emoji_id[color]}>`;
    return colorTableString;
  },

  getAvailableMana:function(currentBattlefield)
  {
    var mana_pool = {
      white: 0,
      black: 0,
      green: 0,
      red: 0,
      blue: 0
    };

    //console.log(currentBattlefield);

    for (i = 0; i < currentBattlefield["lands"].length; i++)
    {
      var LandOnField = currentBattlefield["lands"][i];
      var land = local.lands.filter(search => search.ID == LandOnField.cardID)[0];

      var landColors = JSON.parse(land.colors);

      //console.log(landColors);

      if (!LandOnField.isTapped)
      {
        var keys = Object.keys(landColors.colors);
        keys.forEach((color) => {
          mana_pool[color] += landColors.colors[color]; //basic_mana_to_produce[land.land.toLowerCase()];
        });
      }
    }

    var mana_string = "";
    var keys = Object.keys(mana_pool);

    for (i = 0; i < keys.length; i++)
    {
      //console.log(keys[i]);
      //console.log(local.emoji_id[keys[i]]);

      //const emoji = local.client.emoji.cache.get(local.emoji_id[keys[i]]);
      if (i == keys.length - 1)
      {
        mana_string += "<:" + keys[i] + ":" + local.emoji_id[keys[i]] + "> :" + mana_pool[keys[i]];
        //mana_string += ":" + keys[i] + ":"; //+  " : " + mana_pool[keys[i]];
      }
      else {
        //mana_string += ":" + keys[i] + ": | "; //+  " : " + mana_pool[keys[i]] + " | ";
        mana_string += "<:" + keys[i] + ":" + local.emoji_id[keys[i]] + "> :" + mana_pool[keys[i]] + " | ";
      }
    }

    //console.log(mana_string)
    return mana_string;//local.getManaString(mana_pool);
  },

  shuffle:function(array) {
      var a = array;
      var j, x, i;
      for (i = a.length - 1; i > 0; i--) {
          j = Math.floor(Math.random() * (i + 1));
          x = a[i];
          a[i] = a[j];
          a[j] = x;
      }
      return a;
  },

  returnTierByXP:function(xp)
  {
    const tierValues = Object.values(local.xp_levels);
    const tierKeys = Object.keys(local.xp_levels);
    var commandIndex = -1;

    var level = {};

    tierValues.forEach(function(array) {
      //console.log(array);
      array.forEach(function(element) {
        if (local.between(xp, element.minXP, element.maxXP, true)) {
          level = element;
          level["rank"] = tierKeys[tierValues.indexOf(array)];
          commandIndex = tierValues.indexOf(array);
        }
      });
    });

    if (commandIndex != -1)
      return level;
    else
      return null;
  },

  between:function(num, a, b, inclusive) {
    var min = Math.min.apply(Math, [a, b]),
      max = Math.max.apply(Math, [a, b]);
    return inclusive ? num >= min && num <= max : num > min && num < max;
  },

  getTimeBetween:function(time1, time2)
  {
    var diff = time1 - time2; //in ms

    /*var hours   = Math.floor(diff / 3.6e6);
    var days = Math.floor(hours % 3.6)
    var minutes = Math.floor((diff % 3.6e6) / 6e4);
    var seconds = Math.floor((diff % 6e4) / 1000);*/

    /*var days = Math.floor(num/1440);
    var hours = Math.floor((num%1440)/60);
    var minutes = (num%1440)%60;
    var seconds */

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -=  days * (1000 * 60 * 60 * 24);

    var hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);

    var minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * (1000 * 60);

    var seconds = Math.floor(diff / (1000));
    diff -= seconds * (1000);


    /*var days = Math.floor(seconds / (3600*24));
    seconds  -= days*3600*24;
    var hrs   = Math.floor(seconds / 3600);
    seconds  -= hrs*3600;
    var mnts = Math.floor(seconds / 60);
    seconds  -= mnts*60;*/
    var humanReadable = {};
    humanReadable.days = days;//Math.floor(hours/1440);
    humanReadable.hours = hours;
    humanReadable.minutes = minutes;
    humanReadable.seconds = seconds;
    //console.log(humanReadable); //{hours: 0, minutes: 30}
    return humanReadable;
  },

  isGuildAdmin:function(guildID, userID)
  {
    return local.guildAdmins[guildID].includes(userID);
  },

  readJSONFile:async function(filePath)
  {
    var obj = await local.FILE_SYSTEM.readFileSync(filePath, 'utf8', function (err, data) {
    if (err) throw err; // we'll not consider error handling for now
      var parseObj = JSON.parse(data);
      return parseObj;//console.log(obj);
    });
    //console.log(obj);
    return JSON.parse(obj);
  },

  writeJSONFile:async function(filePath, jsonObj)
  {
    await local.FILE_SYSTEM.writeFileSync(filePath, JSON.stringify(jsonObj), 'utf8', function (err) {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }

    console.log("JSON file has been saved.");
    });
  },

  allowChannelResponse: async function(messageObj)
  {
    var jsonObj = await local.readJSONFile(local.channels_data_file);
    var channelID = messageObj.channel.id;
    var guildID = messageObj.guild.id;

    if (jsonObj[guildID] == undefined || jsonObj[guildID][channelID] == undefined)
      return true;

    return jsonObj[guildID][channelID] == 'locked' ? false : true;
  },

  returnClosestMatchToCard:function(stringToMatchArrayList)
  {
      //stringToMatchArrayList = String(stringToMatchArrayList).capitalize();
      var stringToMatchArray = stringToMatchArrayList.join(" ").split('');

      var card = null;
      var card_index = -1;
      var cardMatch = {};

      //console.log(stringToMatchArrayList);
      //console.log(stringToMatchArray);
      if (stringToMatchArrayList[0] != undefined)
      {
        var firstMatch = stringToMatchArrayList[0];

        //console.log("firstMatch: " + firstMatch);

        var searchForLandCardByIDResult = local.lands.filter(land => land.ID == String(firstMatch).toUpperCase())[0];

        if (!(searchForLandCardByIDResult == undefined && searchForLandCardByIDResult == null))
        {
          //console.log(searchForLandCardByIDResult);
          var resultIndexFirstMatch = local.cards.indexOf(searchForLandCardByIDResult);
          var landCardData = {
            cardID: searchForLandCardByIDResult.ID,
            cardName: searchForLandCardByIDResult.ID.toUpperCase().startsWith("LAND") ? searchForLandCardByIDResult.land : searchForLandCardByIDResult.card_name,
            cardIndex: resultIndexFirstMatch,
            cardObj: searchForLandCardByIDResult//cardID.startsWith("MTG") ? Constants.cards.filter(search => search.ID == cardID)[0] : Constants.lands.filter(search => search.ID == cardID)[0]
          }

          return landCardData;
        }

        var searchForCardByIDResult = local.cards.filter(card => card.ID == String(firstMatch).toUpperCase())[0];

        if (!(searchForCardByIDResult == undefined && searchForCardByIDResult == null))
        {
          //console.log(searchForCardByIDResult);
          var resultIndexFirstMatch = local.cards.indexOf(searchForCardByIDResult);
          var cardData = {
            cardID: searchForCardByIDResult.ID,
            cardName: searchForCardByIDResult.ID.toUpperCase().startsWith("LAND") ? searchForCardByIDResult.land : searchForCardByIDResult.card_name,
            cardIndex: resultIndexFirstMatch,
            cardObj: searchForCardByIDResult//cardID.startsWith("MTG") ? Constants.cards.filter(search => search.ID == cardID)[0] : Constants.lands.filter(search => search.ID == cardID)[0]
          }

          return cardData;
        }
      }

      for (i = 0; i < local.lands.length; i++)
      {
        card = local.lands[i];//.ID.startsWith("LAND") ? Constants.lands.filter(search => search.ID == Constants.cards[i])[0] : Constants.cards.filter(search => search.ID == hand.hand[i])[0];

        var cardNameArray = card.ID.startsWith("MTG") ? card.card_name.toLowerCase().split('') : card.land.toLowerCase().split('');
        var cardIDArray = card.ID.toLowerCase().split('');

        var id_match = 0;
        var name_match = 0;
        var consecutive_letters = 0;

        stringToMatchArray.forEach(function(char) {
          var indexOfChar = stringToMatchArray.indexOf(char);
          if (cardNameArray.includes(String(char).toLowerCase()))
          {
            name_match++;

            if (indexOfChar == stringToMatchArray.length - 1)
              return;

            //if ((stringToMatchArray[indexOfChar] + stringToMatchArray[indexOfChar + 1]) == (cardNameArray[indexOfChar] + cardNameArray[indexOfChar + 1]))
            if ((String(stringToMatchArray[indexOfChar]).toLowerCase() + String(stringToMatchArray[indexOfChar + 1]).toLowerCase()) == (String(cardNameArray[indexOfChar]).toLowerCase() + String(cardNameArray[indexOfChar + 1]).toLowerCase()))
              consecutive_letters++;
          }
          if (cardIDArray.includes(String(char).toLowerCase()))
          {
            id_match++;

            if (indexOfChar == stringToMatchArray.length - 1)
              return;

            if ((stringToMatchArray[indexOfChar] + stringToMatchArray[indexOfChar + 1]) == (cardIDArray[indexOfChar] + cardIDArray[indexOfChar + 1]))
              consecutive_letters++;
          }

        });

        var cardMatchObj = {};
        cardMatch[card.ID] = id_match + name_match + consecutive_letters;
      }

      for (i = 0; i < local.cards.length; i++)
      {
        card = local.cards[i];//.ID.startsWith("LAND") ? Constants.lands.filter(search => search.ID == Constants.cards[i])[0] : Constants.cards.filter(search => search.ID == hand.hand[i])[0];

        var cardNameArray = card.ID.startsWith("MTG") ? card.card_name.toLowerCase().split('') : card.land.toLowerCase().split('');
        var cardIDArray = card.ID.toLowerCase().split('');

        var id_match = 0;
        var name_match = 0;
        var consecutive_letters = 0;

        stringToMatchArray.forEach(function(char) {
          var indexOfChar = stringToMatchArray.indexOf(char);
          if (cardNameArray.includes(String(char).toLowerCase()))
          {
            name_match++;

            if (indexOfChar == stringToMatchArray.length - 1)
              return;

            if ((String(stringToMatchArray[indexOfChar]).toLowerCase() + String(stringToMatchArray[indexOfChar + 1]).toLowerCase()) == (String(cardNameArray[indexOfChar]).toLowerCase() + String(cardNameArray[indexOfChar + 1]).toLowerCase()))
              consecutive_letters++;
          }
          if (cardIDArray.includes(String(char).toLowerCase()))
          {
            id_match++;

            if (indexOfChar == stringToMatchArray.length - 1)
              return;

            if ((stringToMatchArray[indexOfChar] + stringToMatchArray[indexOfChar + 1]) == (cardIDArray[indexOfChar] + cardIDArray[indexOfChar + 1]))
              consecutive_letters++;
          }

        });

        var cardMatchObj = {};
        cardMatch[card.ID] = id_match + name_match + consecutive_letters;
      }

      //card = null;

      var keys = Object.keys(cardMatch);
      var values = Object.values(cardMatch);
      card_index = values.indexOf(Math.max.apply(Math, values));

      //var cardIndex = -1;
      //var cardID = null;
      var resultCard = null;
      var resultIndex = -1;

      if (keys[card_index].toUpperCase().startsWith("LAND")) {
        //console.log(keys[card_index]);
        resultCard = local.lands.filter(search => search.ID == keys[card_index])[0];
        //console.log(resultCard);
        resultIndex = local.lands.indexOf(resultCard);
        //console.log(resultIndex);
      }
      else {
        resultCard = local.cards.filter(search => search.ID == keys[card_index])[0];
        resultIndex = local.cards.indexOf(resultCard);
        //var cardID = Constants.cards[handIndex];
      }

      if (resultIndex < 0)
        return null;

      var cardData = {
        cardID: resultCard.ID,
        cardName: resultCard.ID.toUpperCase().startsWith("LAND") ? resultCard.land : resultCard.card_name,
        cardIndex: resultIndex,
        cardObj: resultCard//cardID.startsWith("MTG") ? Constants.cards.filter(search => search.ID == cardID)[0] : Constants.lands.filter(search => search.ID == cardID)[0]
      }

      return cardData;
  },

  action_gain_xp_currency:async function(obj, currencyAmount = 0)
  {
    var userData = await local.HandleConnection.callDBFunction(`MYSQL-returnQuery`, `SELECT * FROM mtg_user WHERE mtg_userID='${obj.id}'`);
    var userDataObj = userData[0].mtg_user;

    var currencyReceived = parseInt(local.baseCurrencyWinAmount + currencyAmount);
    var currencyUpdate = parseInt(userDataObj.mtg_currency + currencyReceived);// / Constants.gemPercentage) * 100)).toFixed();

    var XPReceived = local.baseXPWinAmount + Math.floor((Math.random() * currencyReceived));
    var XPUpdate = parseInt(userDataObj.mtg_rankxp + XPReceived);
    var lastXPTier = local.returnTierByXP(userDataObj.mtg_rankxp);
    var newXPTier = local.returnTierByXP(XPUpdate);
    var promotionString = lastXPTier != newXPTier ? `${local.emoji_id.balloon}**PROMOTION!!** You have reached ${newXPTier.emoji_id}${newXPTier.rank} Tier ${newXPTier.tierText}! ${local.emoji_id.balloon}\n\n` : '\n';


    await obj.message.channel.send(`<@${obj.id}> -> you received <:currency:${local.emoji_id.currency}>${String(currencyReceived)} and <:exp:${local.emoji_id.exp}> ${XPReceived} XP!\n` +
      `\t\t` + promotionString);

    var updateUserDataQuery = `UPDATE mtg_user SET mtg_currency='${currencyUpdate}', mtg_rankxp='${XPUpdate}' WHERE mtg_userID='${obj.id}'`;
    local.SQL.emit('client-update-sql', updateUserDataQuery);
  },

  pushIDRequest:function(id)
  {
    if (!local.commandRequests.includes(id))
      local.commandRequests.push(id);
  },

  removeIDRequest:function(id)
  {
    if (local.commandRequests.includes(id))
      local.commandRequests.splice(local.commandRequests.indexOf(id), 1);
  },

  getCardArtwork:async function(search)
  {
    //const member = await obj.message.guild.members.fetch(obj.id);
    const canvas = local.Canvas.createCanvas(474, 661);
    const ctx = canvas.getContext('2d');
    var pathRoot = path.dirname(require.main.filename || process.mainModule.filename);
    var imagesFolder = "\\Images";
    var result = false;

    //console.log(search.cardID);

    if (search.cardID.startsWith("LAND")) 
    {
      /*await FILE_SYSTEM.access(`${pathRoot}${imagesFolder}\\${search.cardID}${local.imageFileExtension}`, FILE_SYSTEM.constants.R_OK, (err) => {
        console.log(`${pathRoot}${imagesFolder}\\${search.cardID}${local.imageFileExtension} ${err ? 'is not readable' : 'is readable'}`);

        if (err == undefined || err == null)
        {
          result = true;
        }
        else {
          result = false;
        }
      });*/

      try {
          FILE_SYSTEM.accessSync(`${pathRoot}${imagesFolder}\\${search.cardID}${local.imageFileExtension}`, FILE_SYSTEM.constants.R_OK);
          result = true;
          //console.log(`${file} is both readable and writable`);
      } catch (err) {
          result = false;
          //console.error(`${file} is not accessible!`);
      }

      //console.log("err: " + err);
    }
    else
    {
      result = true;
    }

    if (!result || result == undefined || result == null)
      return null;

    //console.log("Not null card");

    const background = search.cardID.startsWith("LAND") ? await local.Canvas.loadImage(`${pathRoot}${imagesFolder}\\${search.cardID}${local.imageFileExtension}`) : await local.Canvas.loadImage(`${local.imageDir}${local.templateCardFileName}`);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    if (!search.cardID.startsWith("LAND")) {
      ctx.strokeStyle = '#74037b';
      ctx.strokeRect(1, 1, canvas.width, canvas.height);

      // Get the icon in the form of a buffer
      //const { body: buffer } = await snekfetch.get(member.user.displayAvatarURL);
      // Wait for Canvas to load the image
      if (search.cardObj.hasArt) {
        const avatar = await local.Canvas.loadImage(`${local.imageDir}${search.cardID}${local.imageFileExtension}`);
        // Draw a shape onto the main canvas
        ctx.drawImage(avatar, 40, 80, 392, 282);
      }

      if (search.cardObj.description != null && search.cardObj.description != undefined) {
        var description = local.fragmentText(ctx, search.cardObj.description, 130);

        for (i = 0; i < description.length; i++)
        {
          // Pick up the pen
          ctx.font = '28px matrix';//'28px matrix';
      	  ctx.fillStyle = '#000000';
      	  ctx.fillText(description[i], 50, 445 + (i * 30));
        }
      }

      var legendaryText = search.cardObj.ID.startsWith("MTG") && search.cardObj.legendary ? "Legendary " : "";

      ctx.font = 'bold 28px matrix';//'28px matrix';
      ctx.fillStyle = '#000000';
      ctx.fillText(search.cardObj.card_name, 50, 60); //Name
      ctx.fillText(`${legendaryText}${search.cardObj.type.capitalize()}`, 50, 395); //type

      if (search.cardID.startsWith("MTG")) {

        var rarity = search.cardObj.rarity;
        const rarityImg = await local.Canvas.loadImage(`${local.imageDir}${rarity}${local.imageFileExtension}`);
        ctx.drawImage(rarityImg, 395, 370, 40, 35);

        if (search.cardObj.type.toLowerCase() == 'creature')
        {
          ctx.font = 'bold 28px matrix';//'28px matrix';
          ctx.textAlign = "right";
      	  ctx.fillStyle = '#000000';
          ctx.fillText(`${search.cardObj.power}/${search.cardObj.strength}`, 425, 600);
        }

        var mana_cost = JSON.parse(search.cardObj.mana_cost);
        var mana_colors = Object.keys(mana_cost);
        var color_index = 0;
        for(i = 0; i < mana_colors.length; i++)
        {
          var color = mana_colors[i];
          if (mana_cost[color] != undefined && mana_cost[color] > 0)
          {
            ctx.font = '28px matrix';
            ctx.textAlign = "right";
            const mana = await local.Canvas.loadImage(`${local.imageDir}${color}${local.imageFileExtension}`);
            ctx.drawImage(mana, 400 - (color_index * 50), 35, 35, 35);
            ctx.fillText(`${mana_cost[color]}`, 400 - (color_index * 50), 60);
            color_index++;
          }
        }
        //mana cost
      }
    }

    const attachment = new local.Discord.MessageAttachment(canvas.toBuffer(), `card-${search.cardID}.png`);
    //console.log(attachment.toString());
    return attachment;
  },

  fragmentText:function(ctx, text, maxWidth) {
      var words = text.split(' '),
          lines = [],
          line = "";
      if (ctx.measureText(text).width < maxWidth) {
          return [text];
      }
      while (words.length > 0) {
          var split = false;
          while (ctx.measureText(words[0]).width >= maxWidth) {
              var tmp = words[0];
              words[0] = tmp.slice(0, -1);
              if (!split) {
                  split = true;
                  words.splice(1, 0, tmp.slice(-1));
              } else {
                  words[1] = tmp.slice(-1) + words[1];
              }
          }
          if (ctx.measureText(line + words[0]).width < maxWidth) {
              line += words.shift() + " ";
          } else {
              lines.push(line);
              line = "";
          }
          if (words.length === 0) {
              lines.push(line);
          }
      }
      return lines;
  },

  getEquippedEnchantments:function(type, creature, enchantments)
  {
    var totalPower = 0;
    var totalStrength = 0;
    //var creatures = currentBattlefield["creatures"];
    //var creatureIndex = currentBattlefield["creatures"].indexOf(creature);
    //var creatureFieldID = creature.fieldID;

    //console.log(creature);

    if (creature.equipped_cards.length < 1)
    {
      //console.log("length is less than 1");
      return 0;
    }
    //console.log(currentBattlefield["creatures"][creatureIndex].equipped_cards);

    creature["equipped_cards"].forEach(function(field_id) {
      //console.log(field_id);
      //console.log(equipped_card_fieldID);
      //console.log(i);
      var enchantmentOnField = enchantments.filter(enchantment => enchantment.fieldID == field_id)[0];

      //var cardFromArray = currentBattlefield["enchantments"].filter(search => search.fieldID == enchantmentOnField.fieldID)[0];
      //var enchantedCard
      var attributesJSON = enchantmentOnField.attributes;

      //console.log(attributesJSON.cardType);
      if (String(attributesJSON.cardType) == 'aura' || String(attributesJSON.cardType) == 'aura_opponent')
      {
        totalPower += parseInt(attributesJSON.creature.power.add);
        totalPower -= parseInt(attributesJSON.creature.power.subtract);
        totalStrength += parseInt(attributesJSON.creature.strength.add);
        totalStrength -= parseInt(attributesJSON.creature.strength.subtract);
      }
    });

    if (type=='power')
      return totalPower;
    else if (type=='strength')
      return totalStrength;
  },

  displayNewCard: async function(obj, id)
  {
    var getCardByID = id.startsWith("LAND") ? local.lands.filter(search => search.ID == id)[0] : local.cards.filter(search => search.ID == id)[0];

    var mana_string = ``;

    if (getCardByID.type.toLowerCase() == `land`)
    {
      mana_string = id.startsWith("LAND") ? local.returnManaByColorTable(getCardByID.colors) : local.getManaString(JSON.parse(getCardByID.mana_cost));
    }
    else if (getCardByID.type.toLowerCase() == `basic land`)
    {
       mana_string = id.startsWith("LAND") ? local.returnManaByColorTable(getCardByID.colors) : local.getManaString(JSON.parse(getCardByID.mana_cost));
    }
    else
    {
       mana_string = id.startsWith("LAND") ? local.returnManaByColorTable(getCardByID.colors) : local.getManaString(JSON.parse(getCardByID.mana_cost));
    }

    var embed = new local.Discord.MessageEmbed();
    if (id.startsWith("LAND"))
    {
      //console.log(obj.result[0].mtg_startingDeck);
      embed.setTitle("You Drew a Land!");
      embed.setColor(local.color_codes["green"]);
      embed.setDescription(mana_string + getCardByID.land);
    }
    else if (id.startsWith("MTG"))
    {
      var mana_cost = JSON.parse(getCardByID.mana_cost);
      //var color = "";

      var colors = {
        white: mana_cost["white"],
        black: mana_cost["black"],
        green: mana_cost["green"],
        red: mana_cost["red"],
        blue: mana_cost["blue"]
      };

      var keys = Object.keys(colors);
      var values = Object.values(colors);
      var max_color_cost_index = values.indexOf(Math.max.apply(Math, values));

      //console.log(keys[max_color_cost_index]);
      //var keys = [x for x,y in dic.items() if y ==maxx];
      //var colorIndex = colors.values().indexOf(Math.max.apply(Math, colors.values()));
      embed.setTitle(`You drew a ${getCardByID.type}!`);
      embed.setColor(local.color_codes["green"]); //keys[max_color_cost_index]]);
      embed.setDescription(mana_string + getCardByID.card_name);
    }

    var card = null;
    var search = null;

    search = local.returnClosestMatchToCard([id]);

    var searchImageAccessible = false;

    if (local.imageFileLocations[`${search.cardID}${local.imageFileExtension}`] != undefined)
      searchImageAccessible = true;

    if (searchImageAccessible)
    {
      var attachment = await local.getCardArtwork(search);
      await embed.attachFiles([attachment]);
        //embed.setImage(`attachment://${image}`);
    }

    await obj.message.reply({embed});
    return;
  },

  displayRemovedCards:async function(obj, cards)
  {
    var cardNames = [];
    //console.log(cards);
    cards.forEach(function(card) {
      if (String(card).startsWith("LAND")) {
        cardNames.push(local.lands.filter(search => search.ID == card)[0].land);
      }
      else {
        cardNames.push(local.cards.filter(search => search.ID == card)[0].card_name);
      }
    });
    await obj.message.channel.send(`<@${obj.id}> -> **${String(cardNames)}** was removed from your hand!`);
  },

  isNumber:function(num)
  {
    return Number.isNaN(parseFloat(num));
  },

  getRoleTiers:async function(Guild, GuildMember)
  {
    //var PatreonTiers = Constants.patreon_upgrades;
    if (Guild == null || Guild == undefined)
      return null;

    if (GuildMember == null || GuildMember == undefined)
      return null;

    var acceptedTiers = [];

    for (let [name, value] of Object.entries(local.patreon_upgrades)) {
      if (value[0] != undefined && value[0] != null) {
        if (GuildMember.roles.cache.has(value[0].roleId)) {
          acceptedTiers[acceptedTiers.length] = value[0];
        }
      }
    }

    //await acceptedTiers.forEach(async (tier) => {
      //console.log(tier);
    //});

    //console.log("Tiers Checked | " + acceptedTiers.length);

    return acceptedTiers;
  }

};

/*Number.prototype.NaN = function(num) {
  return true;
}*/

Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}

String.prototype.capitalize = function() {
  var charArray = this.split('');
  charArray[0] = charArray[0].toUpperCase();
  return charArray.join('');
}

String.prototype.lowerCase = function() {
  var charArray = this.split('');
  for (i = 0; i < charArray.length; i++)
    charArray[i] = charArray[i].toLowerCase();
  return charArray.join('');
}
module.exports = local;
