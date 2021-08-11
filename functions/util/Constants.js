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
  BotInfo:new BotInfo("Magic: King of the Discord", "0.75.0.15", "suff0cati0n", "m!"),
  client:new Discord.Client(),
  config_file:'./config.json',
  bot_webhook_authorization: 'mtg_kotd_webhook_top_gg',
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
  drawCooldown: 1,
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
  WEB_SERVER:new Events.EventEmitter(),
  NOTIFICATIONS:new Events.EventEmitter(),
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

  _TypeValidation: {

    isNonLandCard:function(args)
    {
      if (args == null || args == undefined)
        return false;

      if ((args.battlefieldObj == null || args.battlefieldObj == undefined) || (args.handObj == null && args.handObj == undefined))
        return args.types.includes(args.cardObjToCheck.type);

      return args.types.includes(args.cardObjToCheck.type);
    },

    isLand:function(args)
    {
      if (args == null || args == undefined)
        return false;

      if ((args.battlefieldObj == null || args.battlefieldObj == undefined) || (args.handObj == null && args.handObj == undefined))
        return args.types.includes(args.cardObjToCheck.type);

      return args.types.includes(args.cardObjToCheck.type);
    },

    isCreature:function(args)
    {
      if (args == null || args == undefined)
        return false;

      if ((args.battlefieldObj == null || args.battlefieldObj == undefined) || (args.handObj == null && args.handObj == undefined))
        return args.types.includes(args.cardObjToCheck.type);

      return args.types.includes(args.cardObjToCheck.type);
    },

    isEquippedCreature:function(args)
    {
      if (args == null || args == undefined)
        return false;

      if ((args.battlefieldObj == null || args.battlefieldObj == undefined) || (args.handObj == null && args.handObj == undefined))
        return false;

      if (args.isHand) {
        //return args.types.includes(args.cardObjToCheck.type);
        return false;
      }

      if (args.isBattlefield) {
        var battlefield = args.battlefieldObj;

        var fieldId = args.fieldId;

        if (fieldId == null || fieldId == undefined)
          return false;

        var creature = battlefield["creatures"][battlefield["creatures"].indexOf(battlefield["creatures"].filter(creature => creature.fieldID == fieldId)[0])];

        return creature.equipped_cards.length > 0;
      }
    },

    isInstantOrSorcerySpell:function(args)
    {
      //console.log(args);

      if (args == null || args == undefined)
        return false;

      if ((args.battlefieldObj == null || args.battlefieldObj == undefined) || (args.handObj == null && args.handObj == undefined))
        return args.types.includes(args.cardObjToCheck.type);

      return args.types.includes(args.cardObjToCheck.type);
    },

    isEnchantment:function(args)
    {
      if (args == null || args == undefined)
        return false;

      if ((args.battlefieldObj == null || args.battlefieldObj == undefined) || (args.handObj == null && args.handObj == undefined))
        return args.types.includes(args.cardObjToCheck.type);

      return args.types.includes(args.cardObjToCheck.type);
    },

    isTappedCreature:function(args)
    {
      if (args == null || args == undefined)
        return false;

      if ((args.battlefieldObj == null || args.battlefieldObj == undefined) || (args.handObj == null && args.handObj == undefined))
        return false;

      if (args.isHand) {
        //return args.types.includes(args.cardObjToCheck.type);
        return false;
      }

      if (args.isBattlefield) {
        var battlefield = args.battlefieldObj;

        var fieldId = args.fieldId;

        if (fieldId == null || fieldId == undefined)
          return false;

        var creature = battlefield["creatures"][battlefield["creatures"].indexOf(battlefield["creatures"].filter(creature => creature.fieldID == fieldId)[0])];

        return (creature.isTapped == true);
      }

      return false;
    },

    isUntappedCreature:function(args)
    {
      if (args == null || args == undefined)
        return false;

      if ((args.battlefieldObj == null || args.battlefieldObj == undefined) || (args.handObj == null && args.handObj == undefined))
        return false;

      if (args.isHand) {
        //return args.types.includes(args.cardObjToCheck.type);
        return false;
      }

      if (args.isBattlefield) {
        var battlefield = args.battlefieldObj;

        var fieldId = args.fieldId;

        if (fieldId == null || fieldId == undefined)
          return false;

        var creature = battlefield["creatures"][battlefield["creatures"].indexOf(battlefield["creatures"].filter(creature => creature.fieldID == fieldId)[0])];

        return (creature.isTapped == false);
      }

      return false;
    },

    isTappedLand:function(args)
    {
      if (args == null || args == undefined)
        return false;

      if ((args.battlefieldObj == null || args.battlefieldObj == undefined) || (args.handObj == null && args.handObj == undefined))
        return false;

      if (args.isHand) {
        //return args.types.includes(args.cardObjToCheck.type);
        return false;
      }

      if (args.isBattlefield) {
        var battlefield = args.battlefieldObj;

        var fieldId = args.fieldId;

        if (fieldId == null || fieldId == undefined)
          return false;

        var land = battlefield["lands"][battlefield["lands"].indexOf(battlefield["lands"].filter(creature => creature.fieldID == fieldId)[0])];

        return (land.isTapped == true);
      }

      return false;
    },

    isUntappedLand:function(args)
    {
      if (args == null || args == undefined)
        return false;

      if ((args.battlefieldObj == null || args.battlefieldObj == undefined) || (args.handObj == null && args.handObj == undefined))
        return false;

      if (args.isHand) {
        //return args.types.includes(args.cardObjToCheck.type);
        return false;
      }

      if (args.isBattlefield) {
        var battlefield = args.battlefieldObj;

        var fieldId = args.fieldId;

        if (fieldId == null || fieldId == undefined)
          return false;

        var land = battlefield["lands"][battlefield["lands"].indexOf(battlefield["lands"].filter(creature => creature.fieldID == fieldId)[0])];

        return (land.isTapped == false);
      }

      return false;
    }
  },

  specialPermanentTypes: {
    'non_land': {
      types: ['creature', 'enchantment', 'instant', 'sorcery'],
      checker: null//[_TypeValidation].isNonLandCard
     },

    'creature': {
      types: ['creature'],
      checker: null//_TypeValidation.isCreature
     },

    'equipped_creature': {
      types: ['creature'],
      checker: null//_TypeValidation.isEquippedCreature
     },

    'tapped_creature': {
      types: ['creature'],
      checker: null//_TypeValidation.isTappedCreature
     },

    'untapped_creature': {
      types: ['creature'],
      checker: null//_TypeValidation.isUntappedCreature
     },

    'spells': {
      types: ['instant', 'sorcery'],
      checker: null//_TypeValidation.isInstantOrSorcerySpell
     },

    'enchantment': {
      types: ['enchatment', 'enchantment - aura'],
      checker: null//_TypeValidation.isEnchantment
     },

    'land': {
      types: ['land', 'basic land'],
      checker: null//_TypeValidation.isLand
     },

    'tapped_land': {
      types: ['land', 'basic land'],
      checker: null//_TypeValidation.isTappedLand
     },

     'untapped_land': {
      types: ['land', 'basic land'],
      checker: null//_TypeValidation.isTappedLand
     }
  },

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

  attributes: [
    "deathtouch",
    "defender",
    "double strike",
    "first strike",
    "flash",
    "flying",
    "haste",
    "hexproof",
    "indestructible",
    "lifelink",
    "menace",
    "reach",
    "trample",
    "vigilance"
  ],
 
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

  voteRewards: {
    cards: 1,
    extraPacks: 2,
    magicBeans: 150
  },

  voteRewardString: '**Thanks for voting!** You have received:\n\n[CARDS]2x <:pack:831077408060604416>\n150x <:currency:831078729638871080>',
  couldNotAwardVoteRewardsString: '**Thanks for voting!** I was not able to issue you any rewards, since I could not find any data associated to your user ID.',
  cooldownString: '**COOLDOWN ALERT:**\n\nYour [0] cooldown is now ready to be used!',

  awardVoteReward:async function(userId, multiplier)
  {
    var cardAmount = local.voteRewards.cards * (multiplier ? 2 : 1);
    var extraPacks = local.voteRewards.extraPacks * (multiplier ? 2 : 1);
    var magicBeans = local.voteRewards.magicBeans * (multiplier ? 2 : 1);

    var cards = local.cards;

    await local.until(_ => local.commandRequests.includes(userId) == false);

    local.pushIDRequest(userId);

    var userDataQuery = `SELECT * from mtg_user WHERE mtg_userID='${userId}';`;
    var userDataResult = await local.HandleConnection.callDBFunction("MYSQL-returnQuery", userDataQuery);

    //console.log(userDataResult);

    if (userDataResult[0] == null || userDataResult[0] == undefined)
    {
      local.removeIDRequest(userId);
      return local.sendDirectMessage(userId, local.couldNotAwardVoteRewardsString, null);
    }


    var res = await local.HandleConnection.callDBFunction("MYSQL-returnQuery", "SELECT * FROM mtg_gamedata WHERE mtg_userID=\'" + userId + "\'");
    //var jsonObj = res;//JSON.parse(res);
    var gameDataObj = res[0].mtg_gamedata;
    var userDataObj = userDataResult[0].mtg_user;
    //var currentHand = JSON.parse(gameDataObj.mtg_currentHand);
    var currentDeck = JSON.parse(gameDataObj.mtg_currentDeck);
    //var currentBattlefield = JSON.parse(gameDataObj.mtg_currentBattlefield);

    var rewards = {
      cards: [],
      currency: 0,
      packs: 0
    }

    for (cardReward = 0; cardReward < cardAmount; cardReward++) {
      var randomCard = cards[Math.floor((Math.random() * cards.length))];

      currentDeck.deck.push(randomCard.ID);
      rewards.cards.push(`${local.getManaString(JSON.parse(randomCard.mana_cost))} ${randomCard.card_name}`);
    };

    currentDeck.deck = local.shuffle(currentDeck.deck);

    //console.log(randomCard);

    var packs_update = userDataObj.mtg_packs + extraPacks;
    rewards.packs = extraPacks;

    var magic_beans_update = userDataObj.mtg_currency + magicBeans;
    rewards.currency = magicBeans;

    var obj = {
      id: userId,
      message: null
    };

    //console.log(rewards);

    var updateUserDataQuery = `UPDATE mtg_user SET mtg_currency='${magic_beans_update}', mtg_packs='${packs_update}' WHERE mtg_userID='${userId}';`;
    var updateGameDataQuery = `UPDATE mtg_gamedata SET mtg_currentDeck='${JSON.stringify(currentDeck)}' WHERE mtg_userID='${userId}';`;

    //var query = ``;

    await local.HandleConnection.callDBFunction('MYSQL-fireAndForget', updateUserDataQuery);
    await local.HandleConnection.callDBFunction('MYSQL-fireAndForget', updateGameDataQuery);
    await local.action_gain_xp_currency(obj, 0);

    local.removeIDRequest(userId);

    return rewards;
  },

  sendDirectMessage:async function(userId, msg, msgFormatIdentifiers)
  {
    const user = await local.client.users.fetch(userId).catch(() => null);

    if (!user) return;

    var msgFormatted = msg;

    //console.log(msgFormatIdentifiers);

    if (msgFormatIdentifiers != null) {
      var inputCardString = ``;
      for (i = 0; i < msgFormatIdentifiers.length; i++)
      {
        inputCardString += `1x ${msgFormatIdentifiers[i]}\n`;
      }

      msgFormatted = String(msgFormatted).replace("[CARDS]", inputCardString);
    }

    await user.send(msgFormatted).catch(() => {
       return console.log(`Attempt to send direct message to ${userId} but user has DMs closed or has no mutual servers with the bot`);
    });
  },

  until:function(conditionFunction) {

    const poll = resolve => {
      if(conditionFunction()) resolve();
      else setTimeout(_ => poll(resolve), 400);
    }

    return new Promise(poll);
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

    if (obj.message != null && obj.message != undefined) {
      await obj.message.channel.send(`<@${obj.id}> -> you received <:currency:${local.emoji_id.currency}>${String(currencyReceived)} and <:exp:${local.emoji_id.exp}> ${XPReceived} XP!\n` + `\t\t` + promotionString);
    }

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
        var description = local.fragmentText(ctx, search.cardObj.description, 160);

        //console.log(description);

        description = description.filter(str => str != "");

        for (i = 0; i < description.length; i++)
        {
          // Pick up the pen
          //console.log("text: " + description[i]);
          /*if (description[i] != undefined && description[i] != null) {
            var hasAttribute = local.containsSpecialAttributes(description[i]);
            //console.log(hasAttribute);
          }*/

          if (description[i] == "" || description[i] == " ")
          {
            //console.log('empty string');
            continue;
          }

          if (i <= 0 && local.containsSpecialAttributes(description[i])) {
            //console.log("print bold");
            ctx.font = 'bold 22px sans';//'28px matrix';
      	    ctx.fillStyle = '#000000';
      	    ctx.fillText(description[i], 50, 445 + (i * 30));
          }
          else {
            //console.log("print non-bold");
            var bold = local.containsSpecialAttributes(description[i]) ? `bold ` : ``;
            ctx.font = `${bold}22px sans`;//'28px matrix';
            ctx.fillStyle = '#000000';
            ctx.fillText(description[i], 50, 445 + (i * 30));
          }
        }
      }

      var legendaryText = search.cardObj.ID.startsWith("MTG") && search.cardObj.legendary ? "Legendary " : "";

      ctx.font = 'bold 28px sans';//'28px matrix';
      ctx.fillStyle = '#000000';
      ctx.fillText(search.cardObj.card_name, 50, 60); //Name
      ctx.fillText(`${legendaryText}${search.cardObj.type.capitalize()}`, 50, 395); //type

      if (search.cardID.startsWith("MTG")) {

        var rarity = search.cardObj.rarity;
        const rarityImg = await local.Canvas.loadImage(`${local.imageDir}${rarity}${local.imageFileExtension}`);
        ctx.drawImage(rarityImg, 395, 370, 40, 35);

        if (search.cardObj.type.toLowerCase() == 'creature')
        {
          ctx.font = 'bold 28px sans';//'28px matrix';
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
            ctx.font = '28px sans';
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

  containsSpecialAttributes:function(text)
  {
    //console.log("text to search: " + text);

    var hasAttribute = false;

    try {

      //return true;

      let checker = function(value) {
        //var prohibited = ['banana', 'apple'];

        //return text.every(function(v) {
          return text.toLowerCase().indexOf(value) >= 0;
        //});
      }

      var arr = local.attributes.filter(checker);
      //console.log(arr);

      return arr.length >= 1;


      /*for (i = 0; i < attributes.length; i++)
      {
        console.log(`checking ${text.toLowerCase()} against ${attributes[i]}`);
        if (text.toLowerCase().includes(attributes[i]))
        {
            console.log(`match found ${text.toLowerCase()} against ${attributes[i]}`);
            hasAttribute = true;
        }
      }*/
    }
    catch (err)
    {
      console.log(err);
    }

    return false;
  },

  fragmentText:function(ctx, text, maxWidth) {
      var textOriginal = text.replace("[NEW_LINE]", " [NEW_LINE] ").split(' ');
      var newLineIndexes = []

      /*textOriginal.forEach((word) => {
        if 
      });*/

      //text = text.replace("[NEW_LINE]", "\n");
      var words = /*text.split(' ')*/textOriginal, lines = [], line = "";
      if (ctx.measureText(text).width < maxWidth) {
          return [text];
      }
      while (words.length > 0) {
          var split = false;

            //if (words[0].toUpperCase().includes("[NEW LINE]"))
              //split = true;

            while (ctx.measureText(words[0]).width >= maxWidth) {
                var tmp = words[0];
                words[0] = tmp.slice(0, -1);
                if (!split) {
                    split = true;
                    words.splice(1, 0, tmp.slice(-1));
                } else {
                    words[1] = tmp.slice(-1) + words[1];
                }

                //console.log(words[0]);
            }

          //console.log(words[0]);

          if (line.includes("[NEW_LINE]"))
          {
            //newLineIndexes
            line = line.replace("[NEW_LINE] ", "");
            lines.push(line);
            line = "";
          }

          if ((ctx.measureText(line + words[0]).width < maxWidth)) {
              //continue current line
              line += words.shift() + " ";
          } 

          else {
              //start new line
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

  displayNewCard: async function(obj, id, target = null)
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

    var username = obj.message.author.username;

    if (target != null)
    {
      var opponent = await obj.message.guild.members.fetch(target);
      //console.log(opponent);
      username = opponent.user.username;
    }

    var embed = new local.Discord.MessageEmbed();
    if (id.startsWith("LAND"))
    {
      //console.log(obj.result[0].mtg_startingDeck);
      embed.setTitle(`${username} Drew a Land!`);
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
      embed.setTitle(`${username} drew a ${getCardByID.type}!`);
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

    await obj.message.channel.send({embed});
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
  },

  isAcceptableTarget:function(RowData, hand, battlefield, lookIn, permanentType)
  {
      //console.log(RowData);
      var acceptable = false;
      //console.log(permanentType);

      lookIn.forEach((field) => {
        if (field == "battlefield") {
          var battlefieldJSON = JSON.parse(battlefield);

          //console.log(battlefieldJSON);

          if (permanentType == "non_land") {

            if (battlefieldJSON["enchantments"].length > 0)
            {
              acceptable = true;
              //return true;
            }

            if (battlefieldJSON["creatures"].length > 0)
            {
              acceptable = true;
              //return true;
            }

          }
          else if (permanentType == "creature") {
            if (battlefieldJSON["creatures"].length > 0)
            {
              acceptable = true;
              //return true;
            }
          }
          else if (permanentType == "enchantment") {
            if (battlefieldJSON["enchantments"].length > 0)
            {
              acceptable = true;
              //return true;
            }
          }
          else if (permanentType == "land") {
            if (battlefieldJSON["lands"].length > 0)
            {
              acceptable = true;
              //return true;
            }
          }
        }
        if (field == "hand") {
          var handJSON = JSON.parse(hand);

          //console.log(handJSON);

          var handData = [];

          hand.hand.forEach((id) => {
              var cardFromLibrary = id.startsWith("MTG") ? local.cards.filter(card => card.ID == id)[0] : local.lands.filter(land => land.ID == id)[0];

              handData.push(cardFromLibrary);
          });

          if (hand.hand.length > 0)
          {
            //acceptable = true;

            handData.forEach((card) => {
              if (card.type.includes(permanentType))
                acceptable = true;
            });
            //return true;
          }
        }
      });

      return acceptable;
  },

  getRandomOpponent:async function(callerId, guildID, permanentType, lookIn)
  {
      var commandRequestsString = `'${callerId}'`;
      if (local.commandRequests.length > 0)
        commandRequestsString += `,`;

      local.commandRequests.forEach(function(id)
      {
        if (local.commandRequests.indexOf(id) == local.commandRequests.length - 1)
          commandRequestsString += `'${id}'`;
        else
          commandRequestsString += `'${id}',`
      });

      //var possibleTargets = [];

      //console.log(`callerID: ${callerId}`);
      //console.log(`guildID: ${guildID}`);

      //var findTargetQuery = `SELECT mtg_user.mtg_userID, mtg_user.mtg_health, mtg_user.mtg_guilds, mtg_gamedata.mtg_userID, mtg_gamedata.mtg_currentBattlefield, mtg_gamedata.mtg_currentHand FROM mtg_user, mtg_gamedata WHERE mtg_user.mtg_userID NOT IN (${commandRequestsString}) AND mtg_user.mtg_userID <> '${callerId}' AND JSON_EXTRACT(mtg_user.mtg_guilds, '$.${Constants.guildPrefix}${guildID}.optedInToServer') > 0 AND mtg_user.mtg_health > 0 GROUP BY mtg_user.mtg_userID, mtg_gamedata.mtg_userID order by rand() LIMIT 30;`;
      var findTargetQuery = `SELECT ud.mtg_userID, ud.mtg_health, ud.mtg_deaths, ud.mtg_guilds, gd.mtg_userID, gd.mtg_currentBattlefield, gd.mtg_currentHand, gd.mtg_currentDeck FROM mtg_user AS ud INNER JOIN mtg_gamedata AS gd ON ud.mtg_userID = gd.mtg_userID WHERE ud.mtg_userID NOT IN (${commandRequestsString}) AND ud.mtg_userID <> '${callerId}' AND JSON_EXTRACT(ud.mtg_guilds, '$.${local.guildPrefix}${guildID}.optedInToServer') > 0 AND ud.mtg_health > 0 GROUP BY ud.mtg_userID, gd.mtg_userID order by rand() LIMIT 30;`;
      //console.log(findTargetQuery);
      var targetData = await local.HandleConnection.callDBFunction("MYSQL-returnQuery", findTargetQuery);

      //console.log(targetData);
      //console.log(targetData[0].mtg_gamedata);

      if (targetData == undefined || targetData == null || targetData.length <= 0)
      {
        console.log("there is currently no one available to be attacked!");
        //Constants.removeIDRequest(obj.id);
        return null;
      }

      var filteredOpponents = [];

      if (permanentType != null && lookIn != null) {
        filteredOpponents = targetData.filter(RowData => local.isAcceptableTarget(RowData, RowData.gd.mtg_currentHand, RowData.gd.mtg_currentBattlefield, lookIn, permanentType));
      }
      else
      {
        filteredOpponents = targetData.filter(RowData => parseInt(RowData.ud.mtg_health) > 0);//local.isAcceptableTarget(RowData, RowData.gd.mtg_currentHand, RowData.gd.mtg_currentBattlefield, lookIn, permanentType))
      }

      if (filteredOpponents.length <= 0)
      {
        console.log(`filteredOpponents empty`)
        return null;
      }

      var chosenOpponent = filteredOpponents[Math.floor((Math.random() * filteredOpponents.length))];
      //var chosenOpponent = targetData

      //var gameDataQuery = `SELECT * from mtg_gamedata WHERE mtg_userID = '${chosenOpponent.mtg_userID}'`;
      //var gameDataResult = await HandleConnection.callDBFunction("MYSQL-returnQuery", gameDataQuery);

      var opponentData = {
        id: chosenOpponent.ud.mtg_userID,
        userData: chosenOpponent.ud,
        gameData: chosenOpponent.gd,
        mtg_currentHand: chosenOpponent.gd.mtg_currentHand,
        mtg_currentBattlefield: chosenOpponent.gd.mtg_currentBattlefield
      }

      //console.log(opponentData);

      return opponentData;
  },

  getPlayerData:async function(target, guildID)
  {
      //var possibleTargets = [];

      //console.log(`callerID: ${callerId}`);
      //console.log(`guildID: ${guildID}`);

      //var findTargetQuery = `SELECT mtg_user.mtg_userID, mtg_user.mtg_health, mtg_user.mtg_guilds, mtg_gamedata.mtg_userID, mtg_gamedata.mtg_currentBattlefield, mtg_gamedata.mtg_currentHand FROM mtg_user, mtg_gamedata WHERE mtg_user.mtg_userID NOT IN (${commandRequestsString}) AND mtg_user.mtg_userID <> '${callerId}' AND JSON_EXTRACT(mtg_user.mtg_guilds, '$.${Constants.guildPrefix}${guildID}.optedInToServer') > 0 AND mtg_user.mtg_health > 0 GROUP BY mtg_user.mtg_userID, mtg_gamedata.mtg_userID order by rand() LIMIT 30;`;
      var findTargetQuery = `SELECT ud.mtg_userID, ud.mtg_health, ud.mtg_deaths, ud.mtg_guilds, gd.mtg_userID, gd.mtg_currentBattlefield, gd.mtg_currentHand, gd.mtg_currentDeck FROM mtg_user AS ud INNER JOIN mtg_gamedata AS gd ON ud.mtg_userID = gd.mtg_userID WHERE ud.mtg_userID = '${target}' GROUP BY ud.mtg_userID, gd.mtg_userID;`;
      //console.log(findTargetQuery);
      var targetData = await local.HandleConnection.callDBFunction("MYSQL-returnQuery", findTargetQuery);

      //console.log(targetData);
      //console.log(targetData[0].mtg_gamedata);

      if (targetData == undefined || targetData == null || targetData.length <= 0)
      {
        console.log("could not find requested player data!");
        //Constants.removeIDRequest(obj.id);
        return null;
      }

      var chosenOpponent = targetData[0];

      var playerData = {
        id: chosenOpponent.ud.mtg_userID,
        userData: chosenOpponent.ud,
        gameData: chosenOpponent.gd,
        mtg_currentHand: chosenOpponent.gd.mtg_currentHand,
        mtg_currentBattlefield: chosenOpponent.gd.mtg_currentBattlefield
      }

      //console.log(opponentData);

      return playerData;
  },

  damagePlayer:async function(obj, caller, target, fieldID = null, amount, displayOutput = true)
  {
    //var t
    if (target == null)
    {
      console.log(`getting random opponent in guild ${obj.guildId}`);
      target = await local.getRandomOpponent(caller, obj.guildId, null, null);
      //console.log(target);
    }
    else
    {
      if (typeof(target) == typeof("STRING")) {
        if (target == caller)
          target = await local.getRandomOpponent(caller, obj.guildId, null, null);
        else
          target = await local.getPlayerData(target, obj.guildId);
      }
    }

    if (target == null) {
      return console.log("no opponents found");
    }

    //console.log(target);

    var opponentID = target.userData.mtg_userID;

    if (caller != opponentID)
      await local.until(_ => local.commandRequests.includes(opponentID) == false);

    local.pushIDRequest(opponentID);

    var opponent_health = parseInt(target.userData.mtg_health);

    opponent_health -= amount;

    var opponent_deaths = parseInt(target.userData.mtg_deaths);

    var caller_username = obj.message.author.username;
    var target_obj = await obj.message.guild.members.fetch(opponentID);
    var target_username = target_obj.user.username;

    //console.log(obj);
    obj.message.channel.send(`**${caller_username}** dealt **${amount}** damage directly to **${target_username}!**`);

    var damageDealt = parseInt(obj.result.result[0].mtg_user.mtg_damagedealt) + amount;
    var opponentDeck = JSON.parse(target.gameData.mtg_currentDeck);
    var opponentBattlefield = JSON.parse(target.gameData.mtg_currentBattlefield);
    var opponentHand = JSON.parse(target.gameData.mtg_currentHand);
    var currentDeck = obj.deck;

    var currentBattlefield = obj.battlefield;
    var currentDeck = obj.deck;
    var currentHand = obj.hand;


    if (opponent_health <= 0)
    {
        var deaths = opponent_deaths + 1;
        //var health = opponent_health;

        var receivedCards = [];
        var receivedCardNameString = "";
        var currencyReceived = 0;

        var now = local.moment().format(local.momentTimeFormat);

        var newHand = {
          hand: [],
          graveyard: [

          ]
        };

        var newDeck = {
          deck: []
        };

        var newBattlefield = {
          "lands": [

          ],
          "creatures": [

          ],
          "enchantments": [

          ]
        };

        for (i = 0; i< local.cardStealAmount; i++)
        {
          //console.log (opponent_gameDataObj);
          var cardIDFromDeck = opponentDeck.deck[Math.floor((Math.random() * opponentDeck.deck.length))]

          if (cardIDFromDeck != null) {
            var cardFromLibrary = cardIDFromDeck.startsWith("LAND") ? local.lands.filter(search => search.ID == cardIDFromDeck)[0] : local.cards.filter(search => search.ID == cardIDFromDeck)[0];
            receivedCards.push(cardFromLibrary);
            currentDeck.deck.push(cardIDFromDeck);
            var card_name = cardIDFromDeck.startsWith("LAND") ? cardFromLibrary.land : cardFromLibrary.card_name;
            var mana_string = cardIDFromDeck.startsWith("LAND") ? local.returnManaByColorTable(cardFromLibrary.colors) : local.getManaString(JSON.parse(cardFromLibrary.mana_cost));
            receivedCardNameString += mana_string + card_name + " (" + cardIDFromDeck + ")\n\t\t";
            //console.log(mana_string);
          }
        }

        currentDeck.deck = local.shuffle(currentDeck.deck);
        var total = (opponentBattlefield.lands.length + opponentDeck.deck.length + opponentHand.graveyard.length);
        var currencyReceived = local.baseCurrencyWinAmount + Math.floor((Math.random() * total));
        var currencyUpdate = parseInt(obj.result.result[0].mtg_user.mtg_currency + currencyReceived);// / Constants.gemPercentage) * 100)).toFixed();
        var kills = parseInt(obj.result.result[0].mtg_user.mtg_kills) + 1;

        var XPReceived = local.baseXPWinAmount + Math.floor((Math.random() * currencyReceived));
        var XPUpdate = parseInt(obj.result.result[0].mtg_user.mtg_rankxp + XPReceived);
        var lastXPTier = local.returnTierByXP(obj.result.result[0].mtg_user.mtg_rankxp);
        var newXPTier = local.returnTierByXP(XPUpdate);
        var promotionString = lastXPTier != newXPTier ? `${local.emoji_id.balloon}**PROMOTION!!** You have reached ${newXPTier.emoji_id}${newXPTier.rank} Tier ${newXPTier.tierText}! ${local.emoji_id.balloon}\n\n` : '\n';


        obj.message.reply(`you killed <@${opponentID}>!
          You received <:currency:${local.emoji_id.currency}>${String(currencyReceived)}, <:exp:${local.emoji_id.exp}> ${XPReceived} XP and ${receivedCards.length} new cards were added to your deck!\n` +
          `\t\t` + promotionString +
          `\t\t` + receivedCardNameString
        );

        updateUserDataQuery = `UPDATE mtg_user SET mtg_damagedealt='${damageDealt}', mtg_currency='${currencyUpdate}', mtg_rankxp='${XPUpdate}', mtg_kills='${kills}' WHERE mtg_userID='${caller}'`;
        updateGameDataQuery = `UPDATE mtg_gamedata SET mtg_currentBattlefield='${JSON.stringify(currentBattlefield)}', mtg_currentDeck='${JSON.stringify(currentDeck)}' WHERE mtg_userID='${caller}';`;

        updateOpponentUserDataQuery = `UPDATE mtg_user SET mtg_health='${opponent_health}', mtg_lastDeathDateTime=STR_TO_DATE('${now}','%m-%d-%Y %H:%i:%s'), mtg_deaths='${deaths}', mtg_reset='1' WHERE mtg_userID='${opponentID}';`;
        updateOpponentGameDataQuery = `UPDATE mtg_gamedata SET mtg_currentBattlefield='${JSON.stringify(newBattlefield)}', mtg_currentDeck='${JSON.stringify(newDeck)}', mtg_currentHand='${JSON.stringify(newHand)}' WHERE mtg_userID='${opponentID}';`;

        await local.HandleConnection.callDBFunction('MYSQL-fireAndForget', updateUserDataQuery);
        await local.HandleConnection.callDBFunction('MYSQL-fireAndForget', updateGameDataQuery);
        await local.HandleConnection.callDBFunction('MYSQL-fireAndForget', updateOpponentGameDataQuery);
        await local.HandleConnection.callDBFunction('MYSQL-fireAndForget', updateOpponentUserDataQuery);
    }
    else
    {
        var total = (opponentBattlefield.lands.length + opponentDeck.deck.length + opponentHand.graveyard.length);
        var currencyReceived = local.baseCurrencyWinAmount + Math.floor((Math.random() * total));
        var currencyUpdate = parseInt(obj.result.result[0].mtg_user.mtg_currency + currencyReceived);// / Constants.gemPercentage) * 100)).toFixed();
        var kills = parseInt(obj.result.result[0].mtg_user.mtg_kills) + 1;

        var XPReceived = local.baseXPWinAmount + Math.floor((Math.random() * currencyReceived));
        var XPUpdate = parseInt(obj.result.result[0].mtg_user.mtg_rankxp + XPReceived);
        var lastXPTier = local.returnTierByXP(obj.result.result[0].mtg_user.mtg_rankxp);
        var newXPTier = local.returnTierByXP(XPUpdate);
        var promotionString = lastXPTier != newXPTier ? `${local.emoji_id.balloon}**PROMOTION!!** You have reached ${newXPTier.emoji_id}${newXPTier.rank} Tier ${newXPTier.tierText}! ${local.emoji_id.balloon}\n\n` : '\n';

        obj.message.reply(`you received <:currency:${local.emoji_id.currency}>${String(currencyReceived)}, <:exp:${local.emoji_id.exp}> ${XPReceived} XP!\n` + `\t\t` + promotionString);

        var updateGameDataQuery = `UPDATE mtg_gamedata SET mtg_currentBattlefield='${JSON.stringify(currentBattlefield)}' WHERE mtg_userID='${obj.id}';`;
        var updateUserDataQuery = `UPDATE mtg_user SET mtg_damagedealt='${damageDealt}', mtg_currency='${currencyUpdate}', mtg_rankxp='${XPUpdate}' WHERE mtg_userID='${obj.id}'`;

        var updateOpponentUserDataQuery = `UPDATE mtg_user SET mtg_health='${opponent_health}' WHERE mtg_userID='${opponentID}';`;
        var updateOpponentGameDataQuery = `UPDATE mtg_gamedata SET mtg_currentBattlefield='${JSON.stringify(opponentBattlefield)}' WHERE mtg_userID='${opponentID}';`;

        await local.HandleConnection.callDBFunction('MYSQL-fireAndForget', updateUserDataQuery);
        await local.HandleConnection.callDBFunction('MYSQL-fireAndForget', updateGameDataQuery);
        await local.HandleConnection.callDBFunction('MYSQL-fireAndForget', updateOpponentGameDataQuery);
        await local.HandleConnection.callDBFunction('MYSQL-fireAndForget', updateOpponentUserDataQuery);
    }
    //console.log(target);

    local.removeIDRequest(opponentID);

    //console.log(`deal ${amount} damage to ${target}`);
  },

  damageTarget:async function(obj, caller, target, fieldID = null, amount, displayOutput = true)
  {

  },

  destroyPermanent:async function(obj, caller, target, fieldID = null, amount, displayOutput = true, permanentType = "non_land")
  {
    if (target == null)
    {
      console.log(`getting random opponent in guild ${obj.guildId}`);
      target = await local.getRandomOpponent(caller, obj.guildId, null, null);
      //console.log(target);
    }
    else
    {
      if (typeof(target) == typeof("STRING")) {
        if (target == caller)
          target = await local.getRandomOpponent(caller, obj.guildId, null, null);
        else
          target = await local.getPlayerData(target, obj.guildId);
      }
    }

    if (target == null) {
      return console.log("no opponents found");
    }

    var opponentID = target.userData.mtg_userID;
    var chosen_target = [];

    if (caller != opponentID)
      await local.until(_ => local.commandRequests.includes(opponentID) == false);

    local.pushIDRequest(opponentID);

    var opponent_gameDataObj = target.gameData;
    var opponentBattlefield = JSON.parse(opponent_gameDataObj.mtg_currentBattlefield);
    var opponentHand = JSON.parse(opponent_gameDataObj.mtg_currentHand);

    chosen_target = await local.chooseTargets(obj, opponentID, opponentBattlefield, amount, permanentType, false, null, null, `Choose up to ${amount} '${permanentType}' permanent(s) to destroy:`);


    //Constants.removeIDRequest(obj.id);
    //Constants.removeIDRequest(opponentID);
    if (chosen_target == null || chosen_target.length < 1)
    {
      obj.message.channel.send(`<@${obj.id}> -> no targets were selected or no '${permanentType}' permanents were available to be targeted!`);
      local.removeIDRequest(opponentID);
      return;
    }

    await forEach(chosen_target, async (target) => {
      var targetCardFromLibrary = target.cardID.startsWith("MTG") ? local.cards.filter(card => card.ID == target.cardID)[0] : local.lands.filter(land => land.ID == target.cardID)[0];
      //opponentHand.hand.splice(opponentHand.hand.indexOf(id), 1);
      if (targetCardFromLibrary.type.toLowerCase().includes('enchantment'))
      {
        if (target.target == null)
        {
          opponentBattlefield["enchantments"].splice(opponentBattlefield["enchantments"].indexOf(target), 1);
        }
        else {
          var creatures = opponentBattlefield["creatures"].filter(creature => creature.fieldID == target.target);

          await forEach(creatures, async (creature) => {
            var indexOfCreature = opponentBattlefield["creatures"].indexOf(creature);
            var equippedCardIndex = opponentBattlefield["creatures"][indexOfCreature].equipped_cards.indexOf(target.fieldID);

            if (equippedCardIndex >= 0)
              opponentBattlefield["creatures"][indexOfCreature].equipped_cards.splice(equippedCardIndex, 1);


          });
          opponentBattlefield["enchantments"].splice(opponentBattlefield["enchantments"].indexOf(target), 1);
        }
      }
      if (targetCardFromLibrary.type.toLowerCase().includes('creature'))
      {
        await forEach(target.equipped_cards, async (equipped_card_id) => {
          var enchantments = await opponentBattlefield["enchantments"].filter(enchantment => enchantment.fieldID == equipped_card_id);
          await forEach(enchantments, async (enchantment) => {
            var indexOfEnchantment = opponentBattlefield["enchantments"].indexOf(enchantment);

            if (indexOfEnchantment < 0)
              return;

            opponentBattlefield["enchantments"].splice(indexOfEnchantment, 1);
            opponentHand.hand.push(enchantment.cardID);
          });
          target.equipped_cards.splice(target.equipped_cards.indexOf(equipped_card_id), 1);

        });
        opponentBattlefield["creatures"].splice(opponentBattlefield["creatures"].indexOf(target), 1);
      }
      if (targetCardFromLibrary.type.toLowerCase().includes('land'))
      { 
        opponentBattlefield["lands"].splice(opponentBattlefield["lands"].indexOf(target), 1);
      }

      //opponentHand.hand.push(target.cardID);
    });

    var updateOpponentGameDataQuery = `UPDATE mtg_gamedata SET mtg_currentHand='${JSON.stringify(opponentHand)}', mtg_currentBattlefield='${JSON.stringify(opponentBattlefield)}' WHERE mtg_userID='${opponentID}';`;
    await local.HandleConnection.callDBFunction('MYSQL-fireAndForget', updateOpponentGameDataQuery);
    local.removeIDRequest(opponentID);
  },

  addCreatureCounter:async function(obj, caller, target, fieldID = null, amount, displayOutput = true, permanentType = "creature", counter = {power: 1, strength: 1})
  {
    if (target == null)
    {
      console.log(`getting random opponent in guild ${obj.guildId}`);
      target = await local.getRandomOpponent(caller, obj.guildId, null, null);
      //console.log(target);
    }
    else
    {
      if (typeof(target) == typeof("STRING")) {
        /*if (target == caller)
          target = await local.getRandomOpponent(caller, obj.guildId, null, null);
        else*/
          target = await local.getPlayerData(target, obj.guildId);
      }
    }

    if (target == null) {
      return console.log("no opponents found");
    }

    var opponentID = target.userData.mtg_userID;
    var chosen_target = [];

    if (caller != opponentID)
      await local.until(_ => local.commandRequests.includes(opponentID) == false);

    local.pushIDRequest(opponentID);

    var opponent_gameDataObj = target.gameData;
    var opponentBattlefield = JSON.parse(opponent_gameDataObj.mtg_currentBattlefield);
    var opponentHand = JSON.parse(opponent_gameDataObj.mtg_currentHand);

    chosen_target = await local.chooseTargets(obj, opponentID, opponentBattlefield, amount, permanentType, false, null, null, `Choose up to ${amount} '${permanentType}' permanent(s) to add a +${counter.power}/+${counter.strength} counter to:`);


    //Constants.removeIDRequest(obj.id);
    //Constants.removeIDRequest(opponentID);
    if (chosen_target == null || chosen_target.length < 1)
    {
      obj.message.channel.send(`<@${obj.id}> -> no targets were selected or no '${permanentType}' permanents were available to be targeted!`);
      local.removeIDRequest(opponentID);
      return;
    }

    await forEach(chosen_target, async (target) => {
      var targetCardFromLibrary = target.cardID.startsWith("MTG") ? local.cards.filter(card => card.ID == target.cardID)[0] : local.lands.filter(land => land.ID == target.cardID)[0];
      //opponentHand.hand.splice(opponentHand.hand.indexOf(id), 1);
      if (targetCardFromLibrary.type.toLowerCase().includes('creature'))
      {
        var indexOfTarget = opponentBattlefield["creatures"].indexOf(target);
        opponentBattlefield["creatures"][indexOfTarget].power += counter.power;
        opponentBattlefield["creatures"][indexOfTarget].strength += counter.strength;
      }
      //opponentHand.hand.push(target.cardID);
    });

    var updateOpponentGameDataQuery = `UPDATE mtg_gamedata SET mtg_currentBattlefield='${JSON.stringify(opponentBattlefield)}' WHERE mtg_userID='${opponentID}';`;
    await local.HandleConnection.callDBFunction('MYSQL-fireAndForget', updateOpponentGameDataQuery);
    local.removeIDRequest(opponentID);

    var result = {
      hand: opponentHand,
      battlefield: opponentBattlefield,
    };

    return result;
  },

  healPlayer:async function(obj, caller, target, fieldID = null, amount, displayOutput = true)
  {
    //var t
    if (target == null)
    {
      console.log(`getting random opponent in guild ${obj.guildId}`);
      target = await local.getRandomOpponent(caller, obj.guildId, null, null);
      //console.log(target);
    }
    else
    {
      if (typeof(target) == typeof("STRING")) {
        target = await local.getPlayerData(target, obj.guildId);
      }
    }

    if (target == null) {
      return console.log("no opponents found");
    }

    var opponentID = target.userData.mtg_userID;

    if (caller != opponentID)
      await local.until(_ => local.commandRequests.includes(opponentID) == false);

    local.pushIDRequest(opponentID);

    var opponent_health = parseInt(target.userData.mtg_health);

    opponent_health += amount;

    var caller_username = obj.message.author.username;
    var target_obj = await obj.message.guild.members.fetch(opponentID);
    var target_username = target_obj.user.username;

    //console.log(obj);
    obj.message.channel.send(`**${target_username}** was healed by ${local.emoji_id.heart}**${amount}**!`);

    //var damageDealt = parseInt(obj.result.result[0].mtg_user.mtg_damagedealt) + amount;
    /*var opponentDeck = JSON.parse(target.gameData.mtg_currentDeck);
    var opponentBattlefield = JSON.parse(target.gameData.mtg_currentBattlefield);
    var opponentHand = JSON.parse(target.gameData.mtg_currentHand);
    var currentDeck = obj.deck;

    var currentBattlefield = obj.battlefield;
    var currentDeck = obj.deck;
    var currentHand = obj.hand;*/

    updateOpponentUserDataQuery = `UPDATE mtg_user SET mtg_health='${opponent_health}' WHERE mtg_userID='${opponentID}';`;
    //updateOpponentGameDataQuery = `UPDATE mtg_gamedata SET mtg_currentBattlefield='${JSON.stringify(newBattlefield)}', mtg_currentDeck='${JSON.stringify(newDeck)}', mtg_currentHand='${JSON.stringify(newHand)}' WHERE mtg_userID='${opponentID}';`;

    //await local.HandleConnection.callDBFunction('MYSQL-fireAndForget', updateUserDataQuery);
    //await local.HandleConnection.callDBFunction('MYSQL-fireAndForget', updateGameDataQuery);
    //await local.HandleConnection.callDBFunction('MYSQL-fireAndForget', updateOpponentGameDataQuery);
    await local.HandleConnection.callDBFunction('MYSQL-fireAndForget', updateOpponentUserDataQuery);

  },

  discardCard:async function(obj, caller, target, fieldID = null, amount, displayOutput = true, permanentType = "non_land")
  {

    if (target == null)
    {
      console.log(`getting random opponent in guild ${obj.guildId}`);
      target = await local.getRandomOpponent(caller, obj.guildId, null, null);
      //console.log(target);
    }
    else
    {
      if (typeof(target) == typeof("STRING")) {
        if (target == caller)
          target = await local.getRandomOpponent(caller, obj.guildId, null, null);
        else
          target = await local.getPlayerData(target, obj.guildId);
      }
    }

    if (target == null) {
      return console.log("no opponents found");
    }

    var opponentID = target.userData.mtg_userID;

    if (caller != opponentID)
      await local.until(_ => local.commandRequests.includes(opponentID) == false);

    local.pushIDRequest(opponentID);

    var chosen_target = [];
    var opponentDeck = JSON.parse(target.gameData.mtg_currentDeck);
    var opponentBattlefield = JSON.parse(target.gameData.mtg_currentBattlefield);
    var opponentHand = JSON.parse(target.gameData.mtg_currentHand);
    var currentDeck = obj.deck;

    var currentBattlefield = obj.battlefield;
    var currentDeck = obj.deck;
    var currentHand = obj.hand;

    //var cardFromLibrary = cardObj.cardID.startsWith("MTG") ? local.cards.filter(card => card.ID == cardObj.cardID)[0] : local.lands.filter(land => land.ID == cardObj.cardID)[0];
    chosen_target = await local.chooseTargets(obj.result, opponentID, opponentBattlefield, amount, permanentType, true, opponentHand, null, `Choose up to ${amount} '${permanentType}' permanent(s) to discard from player's hand:`);

    //Constants.removeIDRequest(obj.id);
    if (chosen_target == null || chosen_target.length < 1)
    {
      obj.message.channel.send(`<@${caller}> -> no targets were selected or no '${permanentType}' permanents were available to be targeted for selected user!`);
      return;
    }

    //console.log(chosen_target);

    await chosen_target.forEach(async (id) => {
      opponentHand.hand.splice(opponentHand.hand.indexOf(id), 1);
    });

    updateOpponentGameDataQuery = `UPDATE mtg_gamedata SET mtg_currentHand='${JSON.stringify(opponentHand)}' WHERE mtg_userID='${opponentID}';`;
    await local.HandleConnection.callDBFunction('MYSQL-fireAndForget', updateOpponentGameDataQuery);

    //var cardName = card.cardID.startsWith("MTG") ? card.cardObj.card_name : card.cardObj.land;
    var chosen_cards = ``;
    if (chosen_target != null)
    {
      for (i = 0; i < chosen_target.length; i++)
      {
        if (typeof(chosen_target[i]) == typeof("STRING"))
        {
          var cardFromLibrary = chosen_target[i].startsWith("MTG") ? local.cards.filter(card => card.ID == chosen_target[i])[0] : local.lands.filter(land => land.ID == chosen_target[i])[0];
          if (i >= chosen_target.length)
            chosen_cards += chosen_target[i].startsWith("MTG") ? cardFromLibrary.card_name + "|" : cardFromLibrary.land + "|";
          else
            chosen_cards += chosen_target[i].startsWith("MTG") ? cardFromLibrary.card_name : cardFromLibrary.land;
        }
        else {
          var cardFromLibrary = chosen_target[i].cardID.startsWith("MTG") ? local.cards.filter(card => card.ID == chosen_target[i].cardID)[0] : local.lands.filter(land => land.ID == chosen_target[i].cardID)[0];
          if (i >= chosen_target.length)
            chosen_cards += chosen_target[i].cardID.startsWith("MTG") ? cardFromLibrary.card_name + "|" : cardFromLibrary.land + "|";
          else
            chosen_cards += chosen_target[i].cardID.startsWith("MTG") ? cardFromLibrary.card_name : cardFromLibrary.land;
        }
      }
    }
    var chosen_target_string = chosen_target == null || chosen_target.length < 1 ? `` : `**${chosen_cards}**`;
    obj.message.reply(`you chose to discard ${chosen_target_string}!`);

    local.removeIDRequest(opponentID);
  },

  //cardTypeFunctions[cardType](obj, obj.callerId, target, obj.target, amount, true, permanentType, counter);
  drawCard:async function(obj, caller, target, fieldID = null, amount, displayOutput = true)
  {
    //console.log(obj);
    //console.log(caller);
    //console.log(target);
    //console.log(amount);
    if (target != null) {
      console.log("card_draw: target not null");
      var gameData = await local.HandleConnection.callDBFunction("MYSQL-returnQuery", "SELECT * FROM mtg_gamedata WHERE mtg_userID=\'" + target + "\'");
      //var jsonObj = res;//JSON.parse(res);
      var gameDataObj = gameData[0].mtg_gamedata;
      var userDataObj = obj.result.result[0].mtg_user;
      var currentHand = JSON.parse(gameDataObj.mtg_currentHand);
      var currentDeck = JSON.parse(gameDataObj.mtg_currentDeck);
      var guildID = obj.message.guild.id;
      var guilds = JSON.parse(userDataObj.mtg_guilds);
      var guildObjID = `${local.guildPrefix}${guildID}`;

      local.pushIDRequest(target);

      var newCards = currentDeck.deck.splice(0, amount);
      newCards.forEach(async function(newCard)
      {
        //console.log(newCard);
        currentHand.hand.push(newCard);
        await local.displayNewCard(obj, newCard, target);
      });

      var query = `UPDATE mtg_gamedata SET mtg_currentHand='${JSON.stringify(currentHand)}', mtg_currentDeck='${JSON.stringify(currentDeck)}' WHERE mtg_userID='${target}';`;
      //var query2 = `UPDATE mtg_user SET mtg_lastCardDrawnDateTime=STR_TO_DATE('${Constants.moment(now).format(Constants.momentTimeFormat)}', '%m-%d-%Y %H:%i:%s') WHERE mtg_userID='${target}';`
      await local.HandleConnection.callDBFunction("MYSQL-fireAndForget", query);
      //await HandleConnection.callDBFunction("MYSQL-fireAndForget", query2);

      for (i = 0; i < amount; i++){
        await local.triggerEvent(caller, target, null, "onCardDraw", null, null, null, obj.result);
      }

      local.removeIDRequest(target);
    }
    else
    {
      console.log("card_draw: target is null, using caller id");
      var gameData = await local.HandleConnection.callDBFunction("MYSQL-returnQuery", "SELECT * FROM mtg_gamedata WHERE mtg_userID=\'" + caller + "\'");
      //var jsonObj = res;//JSON.parse(res);
      var gameDataObj = gameData[0].mtg_gamedata;
      var userDataObj = obj.result.result[0].mtg_user;
      var currentHand = JSON.parse(gameDataObj.mtg_currentHand);
      var currentDeck = JSON.parse(gameDataObj.mtg_currentDeck);
      var guildID = obj.message.guild.id;
      var guilds = JSON.parse(userDataObj.mtg_guilds);
      var guildObjID = `${local.guildPrefix}${guildID}`;

      //local.pushIDRequest(target);

      var newCards = currentDeck.deck.splice(0, amount);
      newCards.forEach(async function(newCard)
      {
        currentHand.hand.push(newCard);
        await local.displayNewCard(obj, newCard, target);
      });

      var query = `UPDATE mtg_gamedata SET mtg_currentHand='${JSON.stringify(currentHand)}', mtg_currentDeck='${JSON.stringify(currentDeck)}' WHERE mtg_userID='${target}';`;
      //var query2 = `UPDATE mtg_user SET mtg_lastCardDrawnDateTime=STR_TO_DATE('${Constants.moment(now).format(Constants.momentTimeFormat)}', '%m-%d-%Y %H:%i:%s') WHERE mtg_userID='${target}';`
      await local.HandleConnection.callDBFunction("MYSQL-fireAndForget", query);
      //await HandleConnection.callDBFunction("MYSQL-fireAndForget", query2);

      for (i = 0; i < amount; i++){
        await local.triggerEvent(caller, target, null, "onCardDraw", null, null, null, obj.result);
      }
    }
  },



  triggerEvent:async function(caller, target = null, fieldID = null, event, battlefieldObj = null, handObj = null, deckObj = null, resultObj = null)
  {
    if (resultObj == null)
      return;

    var obj = {
      result: resultObj,
      message: resultObj.message,
      eventCalled: event,
      guildId: resultObj.message.guild.id,
      callerId: caller,
      targetPlayer: target,
      target: fieldID,
      battlefield: battlefieldObj,
      hand: handObj,
      deck: deckObj
    };

    local.pushIDRequest(caller);

    if (battlefieldObj == null) {
      var userData = await local.HandleConnection.callDBFunction("MYSQL-returnQuery", "SELECT * FROM mtg_user WHERE mtg_userID=\'" + caller + "\'");
      var gameData = await local.HandleConnection.callDBFunction("MYSQL-returnQuery", "SELECT * FROM mtg_gamedata WHERE mtg_userID=\'" + caller + "\'");

      if (gameData == null || gameData.length < 1 || userData == null || userData.length < 1)
      {
        console.log(`No user data was found for '${caller}'!`);
        //Constants.removeIDRequest(obj.id);
        return;
      }

      obj.battlefield = JSON.parse(gameData[0].mtg_gamedata.mtg_currentBattlefield);
      obj.hand = JSON.parse(gameData[0].mtg_gamedata.mtg_currentHand);
      obj.deck = JSON.parse(gameData[0].mtg_gamedata.mtg_currentDeck);
    }

    if (local.battle_events_functions[event] == undefined){
      console.log("ERROR: Unknown event function called!");
      return null;
    }
    
    return local.battle_events_functions[event](obj);
  },

  processTrigger:async function(obj, objArray, type)
  {
    var cardTypeFunctions = {
      "damage": local.damagePlayer,
      "card_draw": local.drawCard,
      "discard_opponent": local.discardCard,
      "destroy_permanent": local.destroyPermanent,
      "heal": local.healPlayer,
      "add_counter": local.addCreatureCounter,
      //"damage_creature": local.damageCreature,
    }
    objArray.forEach((objElement) => {
      //console.log("element: " + objElement);
      var cardFromLibrary = local.cards.filter(search => search.ID == objElement.cardID)[0];

      var attributes = JSON.parse(cardFromLibrary.attributes);

      if (attributes != null)
      {
        //console.log(`attributes not null`);
        //console.log(attributes);
        if (attributes["cardType"] != null && attributes["cardType"] != undefined)
        {
          //console.log(`attribute cardTypes not null`);
          var cardTypes = attributes.cardType;

          //console.log(cardTypes);

          cardTypes.forEach((cardType) => {
            //console.log(cardType);
            if (cardTypeFunctions[cardType] != undefined) {

              var cardTypeAttributes = attributes[cardType];

              if (cardTypeAttributes != undefined && cardTypeAttributes != null) {

                var add = 0;
                var subtract = 0;
                var amount = 0;

                if (cardTypeAttributes["add"] != null && cardTypeAttributes["add"] != undefined)
                  add = cardTypeAttributes.add;

                if (cardTypeAttributes["subtract"] != null && cardTypeAttributes["subtract"] != undefined)
                  subtract = cardTypeAttributes.subtract;

                if (cardTypeAttributes["amount"] != null && cardTypeAttributes["amount"] != undefined)
                  subtract = cardTypeAttributes.subtract;

                var amountFixed = (amount + add) - subtract;
                var source = cardTypeAttributes.source;

                var target = source == "self" ? obj.callerId : obj.targetPlayer;

                var permanentType = (cardTypeAttributes["permanent_type"] == null || cardTypeAttributes["permanent_type"] == undefined) ? "non_land" : cardTypeAttributes["permanent_type"];

                //console.log(permanentType);

                var counter = {
                  power: 1,
                  strength: 1
                }

                if (cardType.toLowerCase() == 'add_counter')
                {
                  counter.power = cardTypeAttributes.power;
                  counter.strength = cardTypeAttributes.strength;
                }

                cardTypeFunctions[cardType](obj, obj.callerId, target, obj.target, amountFixed, true, permanentType, counter);

                //console.log(`running event trigger function ${cardType}`);
              }
            }
          });
        }
        else
        {
          //console.log(`attributes cardTypes is null or undefined`);
        }
      }
    })
  },

  battle_events_functions: {

     hasTrigger:function(cardID, trigger){
       var card = local.cards.filter(search => search.ID == cardID)[0];

       var attributes = JSON.parse(card.attributes);

       if (attributes == undefined || attributes == null)
         return false;

       if (attributes.triggers == undefined || attributes.triggers == null)
         return false;

       return attributes.triggers.includes(trigger);
     },

     getMatchingTriggerCards:function(callerId, targetId = null, battlefield, type, trigger)
     {
       if (battlefield == null)
         return null;

       if (type.toLowerCase() == 'creature'){
         var creatures = battlefield["creatures"].filter(creature => local.battle_events_functions.hasTrigger(creature.cardID, trigger));

         return creatures;
       }
       else if (type.toLowerCase() == 'enchantment')
       {
         var enchantments = battlefield["enchantments"].filter(enchantment => local.battle_events_functions.hasTrigger(enchantment.cardID, trigger));

         return enchantments;
       }


       return null;
     },

     onCardDraw:async function(obj)
     {
       //console.log("onCardDraw");

       var creatures = local.battle_events_functions.getMatchingTriggerCards(obj.callerId, obj.targetPlayer, obj.battlefield, "creature", "onCardDraw");
       var enchantments = local.battle_events_functions.getMatchingTriggerCards(obj.callerId, obj.targetPlayer, obj.battlefield, "enchantment", "onCardDraw");

       //console.log(creatures);
       //console.log(enchantments);
       //console.log(obj);

       if (obj.result.result[0].mtg_user.mtg_reset == 1) {
        //obj.message.reply(" you were killed recently. You must first get a new deck with \`m!begin\` before trying to play!");
        return;
       }

       //console.log(obj.result);

       var userDataObj = obj.result.result[0];
       var guildID = obj.message.guild.id;
       var guilds = JSON.parse(userDataObj.mtg_user.mtg_guilds);
       var guildObjID = `${local.guildPrefix}${guildID}`;

       if (guilds[guildObjID] == undefined || guilds[guildObjID].optedInToServer == 0) {
        //obj.message.reply(" you must first opt in before you can draw cards!");
        return;
       }


       if (obj.message != null)
       {
         //console.log(`message not null`);
         creatures.forEach((creature) => {
           var creatureFromLibrary = local.cards.filter(search => search.ID == creature.cardID)[0];
           obj.message.reply(`${creatureFromLibrary.card_name}'s card draw event was triggered!`);
         });

         enchantments.forEach((enchantment) => {
           var enchantmentFromLibrary = local.cards.filter(search => search.ID == enchantment.cardID)[0];
           obj.message.reply(`${enchantmentFromLibrary.card_name}'s card draw event was triggered!`);
         });
         
       }
       await local.processTrigger(obj, creatures, "creatures", "onCardDraw");
       await local.processTrigger(obj, enchantments, "enchantments", "onCardDraw");

       //console.log('');

       local.removeIDRequest(obj.callerId);
     },

     onBeginTurn:async function(obj)
     {
       //console.log("onBeginTurn");

       var creatures = local.battle_events_functions.getMatchingTriggerCards(obj.callerId, obj.targetPlayer, obj.battlefield, "creature", "onBeginTurn");
       var enchantments = local.battle_events_functions.getMatchingTriggerCards(obj.callerId, obj.targetPlayer, obj.battlefield, "enchantment", "onBeginTurn");

       //console.log(creatures);
       //console.log(enchantments);
       //console.log(obj);

       if (obj.result.result[0].mtg_user.mtg_reset == 1) {
        //obj.message.reply(" you were killed recently. You must first get a new deck with \`m!begin\` before trying to play!");
        return;
       }

       //console.log(obj.result);

       var userDataObj = obj.result.result[0];
       var guildID = obj.message.guild.id;
       var guilds = JSON.parse(userDataObj.mtg_user.mtg_guilds);
       var guildObjID = `${local.guildPrefix}${guildID}`;

       if (guilds[guildObjID] == undefined || guilds[guildObjID].optedInToServer == 0) {
        //obj.message.reply(" you must first opt in!");
        return;
       }


       if (obj.message != null)
       {
         //console.log(`message not null`);
         creatures.forEach((creature) => {
           var creatureFromLibrary = local.cards.filter(search => search.ID == creature.cardID)[0];
           obj.message.reply(`${creatureFromLibrary.card_name}'s ability was triggered!`);
         });

         enchantments.forEach((enchantment) => {
           var enchantmentFromLibrary = local.cards.filter(search => search.ID == enchantment.cardID)[0];
           obj.message.reply(`${enchantmentFromLibrary.card_name}'s ability was triggered!`);
         });
         
       }
       await local.processTrigger(obj, creatures, "creatures", "onBeginTurn");
       await local.processTrigger(obj, enchantments, "enchantments", "onBeginTurn");

       //console.log('');

       local.removeIDRequest(obj.callerId);
     },

     onEnterBattlefield:async function(obj)
     {
       //console.log("onEnterBattlefield");

       var creaturesArray = obj.battlefield["creatures"].filter(creature => local.battle_events_functions.hasTrigger(creature.cardID, "onEnterBattlefield") && obj.target == creature.fieldID);//local.battle_events_functions.getMatchingTriggerCards(obj.callerId, obj.targetPlayer, obj.battlefield, "creature", "onEnterBattlefield");
       var enchantmentsArray = obj.battlefield["enchantments"].filter(enchantment => local.battle_events_functions.hasTrigger(enchantment.cardID, "onEnterBattlefield") && obj.target == enchantment.fieldID);//local.battle_events_functions.getMatchingTriggerCards(obj.callerId, obj.targetPlayer, obj.battlefield, "enchantment", "onEnterBattlefield");

       //console.log(creaturesArray);
       //console.log(enchantmentsArray);
       //console.log(obj);

       if (obj.result.result[0].mtg_user.mtg_reset == 1) {
        //obj.message.reply(" you were killed recently. You must first get a new deck with \`m!begin\` before trying to play!");
        return;
       }

       //console.log(obj.result);

       var userDataObj = obj.result.result[0];
       var guildID = obj.message.guild.id;
       var guilds = JSON.parse(userDataObj.mtg_user.mtg_guilds);
       var guildObjID = `${local.guildPrefix}${guildID}`;

       if (guilds[guildObjID] == undefined || guilds[guildObjID].optedInToServer == 0) {
        //obj.message.reply(" you must first opt in!");
        return;
       }


       var creatures = [];
       var enchantments = [];


       if (obj.message != null)
       {
         //console.log(`message not null`);
         creaturesArray.forEach((creature) => {
           if (creature.fieldID == obj.target) {
             creatures.push(creature);
             var creatureFromLibrary = local.cards.filter(search => search.ID == creature.cardID)[0];
             obj.message.reply(`${creatureFromLibrary.card_name}'s ability was triggered!`);
           }
         });

         enchantmentsArray.forEach((enchantment) => {
           if (enchantment.fieldID == obj.target) {
             enchantments.push(enchantment);
             var enchantmentFromLibrary = local.cards.filter(search => search.ID == enchantment.cardID)[0];
             obj.message.reply(`${enchantmentFromLibrary.card_name}'s ability was triggered!`);
           }
         });
         
       }

       if (creatures.length > 0)
         await local.processTrigger(obj, creatures, "creatures", "onEnterBattlefield");

       if (enchantments.length > 0)
         await local.processTrigger(obj, enchantments, "enchantments", "onEnterBattlefield");

       //console.log('');

       local.removeIDRequest(obj.callerId);
     },

     onCreatureDeath:async function(obj)
     {
       //console.log("onCreatureDeath");

       var creatures = local.battle_events_functions.getMatchingTriggerCards(obj.callerId, obj.targetPlayer, obj.battlefield, "creature", "onCreatureDeath");
       var enchantments = local.battle_events_functions.getMatchingTriggerCards(obj.callerId, obj.targetPlayer, obj.battlefield, "enchantment", "onCreatureDeath");

       //console.log(creatures);
       //console.log(enchantments);
       //console.log(obj);

       if (obj.result.result[0].mtg_user.mtg_reset == 1) {
        //obj.message.reply(" you were killed recently. You must first get a new deck with \`m!begin\` before trying to play!");
        return;
       }

       //console.log(obj.result);

       var userDataObj = obj.result.result[0];
       var guildID = obj.message.guild.id;
       var guilds = JSON.parse(userDataObj.mtg_user.mtg_guilds);
       var guildObjID = `${local.guildPrefix}${guildID}`;

       if (guilds[guildObjID] == undefined || guilds[guildObjID].optedInToServer == 0) {
        //obj.message.reply(" you must first opt in!");
        return;
       }


       if (obj.message != null)
       {
         //console.log(`message not null`);
         creatures.forEach((creature) => {
           var creatureFromLibrary = local.cards.filter(search => search.ID == creature.cardID)[0];
           obj.message.reply(`${creatureFromLibrary.card_name}'s ability was triggered!`);
         });

         enchantments.forEach((enchantment) => {
           var enchantmentFromLibrary = local.cards.filter(search => search.ID == enchantment.cardID)[0];
           obj.message.reply(`${enchantmentFromLibrary.card_name}'s ability was triggered!`);
         });
         
       }
       await local.processTrigger(obj, creatures, "creatures", "onCreatureDeath");
       await local.processTrigger(obj, enchantments, "enchantments", "onCreatureDeath");

       //console.log('');

       local.removeIDRequest(obj.callerId);
     },

     onDamageDealt:async function(obj)
     {
       //console.log("onDamageDealt");

       var creatures = local.battle_events_functions.getMatchingTriggerCards(obj.callerId, obj.targetPlayer, obj.battlefield, "creature", "onDamageDealt");
       var enchantments = local.battle_events_functions.getMatchingTriggerCards(obj.callerId, obj.targetPlayer, obj.battlefield, "enchantment", "onDamageDealt");

       //console.log(creatures);
       //console.log(enchantments);
       //console.log(obj);

       if (obj.result.result[0].mtg_user.mtg_reset == 1) {
        //obj.message.reply(" you were killed recently. You must first get a new deck with \`m!begin\` before trying to play!");
        return;
       }

       //console.log(obj.result);

       var userDataObj = obj.result.result[0];
       var guildID = obj.message.guild.id;
       var guilds = JSON.parse(userDataObj.mtg_user.mtg_guilds);
       var guildObjID = `${local.guildPrefix}${guildID}`;

       if (guilds[guildObjID] == undefined || guilds[guildObjID].optedInToServer == 0) {
        //obj.message.reply(" you must first opt in!");
        return;
       }


       if (obj.message != null)
       {
         //console.log(`message not null`);
         creatures.forEach((creature) => {
           var creatureFromLibrary = local.cards.filter(search => search.ID == creature.cardID)[0];
           obj.message.reply(`${creatureFromLibrary.card_name}'s ability was triggered!`);
         });

         enchantments.forEach((enchantment) => {
           var enchantmentFromLibrary = local.cards.filter(search => search.ID == enchantment.cardID)[0];
           obj.message.reply(`${enchantmentFromLibrary.card_name}'s ability was triggered!`);
         });
         
       }
       await local.processTrigger(obj, creatures, "creatures", "onDamageDealt");
       await local.processTrigger(obj, enchantments, "enchantments", "onDamageDealt");

       //console.log('');

       local.removeIDRequest(obj.callerId);
     },

     onSentToGraveyard:async function(obj)
     {
       //console.log("onSentToGraveyard");

       var creaturesArray = obj.battlefield["creatures"];//local.battle_events_functions.getMatchingTriggerCards(obj.callerId, obj.targetPlayer, obj.battlefield, "creature", "onEnterBattlefield");
       var enchantmentsArray = obj.battlefield["enchantments"];//local.battle_events_functions.getMatchingTriggerCards(obj.callerId, obj.targetPlayer, obj.battlefield, "enchantment", "onEnterBattlefield");

       //console.log(creaturesArray);
       //console.log(enchantmentsArray);
       //console.log(obj);

       if (obj.result.result[0].mtg_user.mtg_reset == 1) {
        //obj.message.reply(" you were killed recently. You must first get a new deck with \`m!begin\` before trying to play!");
        return;
       }

       //console.log(obj.result);

       var userDataObj = obj.result.result[0];
       var guildID = obj.message.guild.id;
       var guilds = JSON.parse(userDataObj.mtg_user.mtg_guilds);
       var guildObjID = `${local.guildPrefix}${guildID}`;

       if (guilds[guildObjID] == undefined || guilds[guildObjID].optedInToServer == 0) {
        //obj.message.reply(" you must first opt in!");
        return;
       }


       var creatures = [];
       var enchantments = [];


       if (obj.message != null)
       {
         //console.log(`message not null`);
         creaturesArray.forEach((creature) => {
           if (creature.fieldID == obj.target) {
             creatures.push(creature);
             var creatureFromLibrary = local.cards.filter(search => search.ID == creature.cardID)[0];
             obj.message.reply(`${creatureFromLibrary.card_name}'s ability was triggered!`);
           }
         });

         enchantmentsArray.forEach((enchantment) => {
           if (enchantment.fieldID == obj.target) {
             enchantments.push(enchantment);
             var enchantmentFromLibrary = local.cards.filter(search => search.ID == enchantment.cardID)[0];
             obj.message.reply(`${enchantmentFromLibrary.card_name}'s ability was triggered!`);
           }
         });
         
       }
       await local.processTrigger(obj, creatures, "creatures", "onSentToGraveyard");
       await local.processTrigger(obj, enchantments, "enchantments", "onSentToGraveyard");

       //console.log('');

       local.removeIDRequest(obj.callerId);
     },

  },

  chooseTargets:async function(obj, id, battlefield, amount, permanentType, isHand = false, hand = null, cardFromLibrary = null, descriptionText = "")
  {
    var selectedCreature = null;
    var emojis = local.emoji_letters.slice(0, 26);
    var emojiPairs = {};
    var targets = [];

    const filter = (reaction, user) => {
      //console.log(reaction);
      return emojis.includes(reaction._emoji.name) && user.id == obj.id;
    };

    const member = await obj.message.guild.members.fetch(id);
    const description = cardFromLibrary == null ? '' : cardFromLibrary.description;
    const title = isHand ? `${member.user.username}'s Hand` : member.user.username + "\'s Battlefield";
    const embed = new local.Discord.MessageEmbed()
    //console.log(obj.result[0].mtg_startingDeck);
    .setTitle(title)
    .setDescription(`Card Attributes: ${description}\n\n${descriptionText}`)
    .setColor(local.color_codes.black)

    //if (permanentType.toLowerCase() == 'untapped_creature' || permanentType.toLowerCase() == 'tapped_creature' || permanentType.toLowerCase() == 'equipped_creature' || permanentType.toLowerCase() == 'creature' || permanentType.toLowerCase() == 'non_land' || permanentType.toLowerCase() == 'enchantment' || permanentType.toLowerCase() == 'land')
    //{
      //var creatures = battlefield["creatures"];
      //emojis =
      //emojiPairs = {};
      /*if (!isHand)
      {
        if (battlefield["creatures"].length < 1)
          return null;
      }
      else {
        if (hand.hand.length < 1)
          return null;
      }*/

      var emoji_index = 0;
      //for (i = 0; i < battlefield["creatures"].length; i++)

      if (!isHand)
      {
        var lands = [];

        await battlefield["creatures"].forEach(async (creature) =>
        {
            var cardFromLibrary = local.cards.filter(search => search.ID == creature.cardID)[0];

            var attributes = JSON.parse(cardFromLibrary.attributes);
            var hasHexproof = false;

            if (attributes["creature_attributes"] != null && attributes["creature_attributes"] != undefined)
            {
              if (attributes["creature_attributes"].includes("hexproof") && (obj.id != id))
              {
                hasHexproof = true;
              }
            }

            var typeValidationObj = {
              callerId: obj.id,
              targetId: id,
              fieldId: creature.fieldID,
              cardObjToCheck: cardFromLibrary,
              battlefieldObj: battlefield,
              handObj: null,
              isHand: false,
              isBattlefield: true,
              types: local.specialPermanentTypes[permanentType].types
            };

            if (local.specialPermanentTypes[permanentType].checker(typeValidationObj) && !hasHexproof)
            {

              var isAttacking = creature.isDeclaredAttacker ? local.emoji_id.sword : '';
              var isDefending = creature.isDeclaredDefender ? local.emoji_id.shield : '';
              var legendaryStatus = cardFromLibrary.legendary ? "- Legendary" : "";
              var isTapped = creature.isTapped ? `<:tapped:${local.emoji_id.tapped}> *(tapped)*` : ``;
              var creatureStats = `${cardFromLibrary.power + local.getEquippedEnchantments("power", creature, battlefield["enchantments"])}/${cardFromLibrary.strength + local.getEquippedEnchantments("strength", creature, battlefield["enchantments"])}`;
              var isCreatureDisplayStatsString = cardFromLibrary.type == 'creature' ? `${creatureStats} ${isAttacking}${isDefending}` : ``;

              emojiPairs[emojis[emoji_index]] = creature;
              embed.addField(`${cardFromLibrary.type.capitalize()} ${legendaryStatus}`, `${emojis[emoji_index]} ${isTapped} ${cardFromLibrary.card_name} ${isCreatureDisplayStatsString}`, false);
              emoji_index++;
            }
        });

        await battlefield["enchantments"].forEach(async (enchantment) =>
        {
            var cardFromLibrary = local.cards.filter(search => search.ID == enchantment.cardID)[0];

            var attributes = JSON.parse(cardFromLibrary.attributes);
            var hasHexproof = false;

            if (attributes["creature_attributes"] != null && attributes["creature_attributes"] != undefined)
            {
              if (attributes["creature_attributes"].includes("hexproof") && (obj.id != id))
              {
                hasHexproof = true;
              }
            }

            var typeValidationObj = {
              callerId: obj.id,
              targetId: id,
              fieldId: enchantment.fieldID,
              cardObjToCheck: cardFromLibrary,
              battlefieldObj: battlefield,
              handObj: null,
              isHand: false,
              isBattlefield: true,
              types: local.specialPermanentTypes[permanentType].types
            };

            if (local.specialPermanentTypes[permanentType].checker(typeValidationObj) && !hasHexproof)
            {
              var description = (cardFromDeck.description == null || cardFromDeck.description == undefined) ? "No Description Available" : cardFromDeck.description.replace("[NEW_LINE]", " - ");

              emojiPairs[emojis[emoji_index]] = enchantment;
              embed.addField(`${cardFromDeck.type.capitalize()}`, `${emojis[emoji_index]} ${cardFromDeck.card_name} - ${description}`, false);
              emoji_index++;
            }
        });

        await battlefield["lands"].forEach(async (land) =>
        {
            var cardFromLibrary = local.lands.filter(search => search.ID == land.cardID)[0];

            var typeValidationObj = {
              callerId: obj.id,
              targetId: id,
              fieldId: land.fieldID,
              cardObjToCheck: cardFromLibrary,
              battlefieldObj: battlefield,
              handObj: null,
              isHand: false,
              isBattlefield: true,
              types: local.specialPermanentTypes[permanentType].types
            };

            if (local.specialPermanentTypes[permanentType].checker(typeValidationObj))
            {
              var description = '';
              var card_name = '';

              if (land.cardID.startsWith("MTG"))
              {
                description = (cardFromLibrary.description == null || cardFromLibrary.description == undefined) ? "No Description Available" : cardFromLibrary.description.replace("[NEW_LINE]", " - ");
                card_name = cardFromLibrary.card_name;
              }
              else
              {
                description = local.returnManaByColorTable(cardFromLibrary.colors);
                card_name = cardFromLibrary.land;
              }

              if (!lands.includes(land.cardID)) {
                emojiPairs[emojis[emoji_index]] = land;
                embed.addField(`${cardFromLibrary.type.capitalize()}`, `${emojis[emoji_index]} ${card_name} - ${description}`, false);
                emoji_index++;
                lands.push(land.cardID);
              }
            }
        });
      }
      else {

        var lands = [];

        //console.log(hand);

        await hand.hand.forEach(async (cardInHand) =>
        {
            //console.log(emojis[i]);

            var cardFromLibrary = cardInHand.startsWith("MTG") ? local.cards.filter(search => search.ID == cardInHand)[0] : local.lands.filter(search => search.ID == cardInHand)[0];

            //if (cardFromLibrary == undefined || cardFromLibrary == null)
              //continue;

            var typeValidationObj = {
              callerId: obj.id,
              targetId: id,
              fieldId: null,
              cardObjToCheck: cardFromLibrary,
              battlefieldObj: battlefield,
              handObj: hand.hand,
              isHand: true,
              isBattlefield: false,
              types: local.specialPermanentTypes[permanentType].types
            };

            if (local.specialPermanentTypes[permanentType].checker(typeValidationObj))
            {
              var description = '';
              var card_name = '';

              if (cardInHand.startsWith("MTG"))
              {
                description = (cardFromLibrary.description == null || cardFromLibrary.description == undefined) ? "No Description Available" : cardFromLibrary.description.replace("[NEW_LINE]", " - ");
                card_name = cardFromLibrary.card_name;
              }
              else
              {
                description = local.returnManaByColorTable(cardFromLibrary.colors);
                card_name = cardFromLibrary.land;
              }

              if (!lands.includes(cardInHand)) {
                emojiPairs[emojis[emoji_index]] = cardInHand;
                embed.addField(`${cardFromLibrary.type.capitalize()}`, `${emojis[emoji_index]} ${card_name} - ${description}`, false);
                emoji_index++;
                lands.push(cardInHand)
              }
            }

            /*if (permanentType.toLowerCase() == 'non_land' && !isNonLandCard(cardInHand))
            {  }
            else if (permanentType.toLowerCase() == 'non_land' || permanentType.toLowerCase() == "enchantment")
            {
              var cardFromLibrary = Constants.cards.filter(search => search.ID == cardInHand)[0];
              var description = (cardFromLibrary.description == null || cardFromLibrary.description == undefined) ? "No Description Available" : cardFromLibrary.description.replace("[NEW_LINE]", " - ");

              //var isAttacking = creature.isDeclaredAttacker ? Constants.emoji_id.sword : '';
              //var isDefending = creature.isDeclaredDefender ? Constants.emoji_id.shield : '';
              //var legendaryStatus = cardFromLibrary.legendary ? "- Legendary" : "";
              //var isTapped = creature.isTapped ? `<:tapped:${Constants.emoji_id.tapped}> *(tapped)*` : ``;
              //var creatureStats = `${cardFromLibrary.power + Constants.getEquippedEnchantments("power", creature, battlefield["enchantments"])}/${cardFromLibrary.strength + Constants.getEquippedEnchantments("strength", creature, battlefield["enchantments"])}`;
              //var isCreatureDisplayStatsString = cardFromLibrary.type == 'creature' ? `${creatureStats} ${isAttacking}${isDefending}` : ``;

              emojiPairs[emojis[emoji_index]] = cardInHand;
              embed.addField(`${cardFromLibrary.type.capitalize()}`, `${emojis[emoji_index]} ${cardFromLibrary.card_name} - ${description}`, false);
              emoji_index++;
            }
            else if (permanentType.toLowerCase() == 'land' && !isNonLandCard(cardInHand))
            {
              var cardFromLibrary = Constants.lands.filter(search => search.ID == cardInHand)[0];
              var description = (cardFromLibrary.description == null || cardFromLibrary.description == undefined) ? "No Description Available" : cardFromLibrary.description.replace("[NEW_LINE]", " - ");

              //var isAttacking = creature.isDeclaredAttacker ? Constants.emoji_id.sword : '';
              //var isDefending = creature.isDeclaredDefender ? Constants.emoji_id.shield : '';
              //var legendaryStatus = cardFromLibrary.legendary ? "- Legendary" : "";
              //var isTapped = creature.isTapped ? `<:tapped:${Constants.emoji_id.tapped}> *(tapped)*` : ``;
              //var creatureStats = `${cardFromLibrary.power + Constants.getEquippedEnchantments("power", creature, battlefield["enchantments"])}/${cardFromLibrary.strength + Constants.getEquippedEnchantments("strength", creature, battlefield["enchantments"])}`;
              //var isCreatureDisplayStatsString = cardFromLibrary.type == 'creature' ? `${creatureStats} ${isAttacking}${isDefending}` : ``;

              if (!lands.includes(cardFromLibrary.ID)){
                emojiPairs[emojis[emoji_index]] = cardInHand;
                embed.addField(`${cardFromLibrary.type.capitalize()}`, `${emojis[emoji_index]} ${cardFromLibrary.card_name} - ${description}`, false);
                emoji_index++;
                lands.push(cardFromLibrary.ID);
              }
            }
            else {

              var cardFromLibrary = Constants.cards.filter(search => search.ID == cardInHand)[0];
              var description = (cardFromLibrary.description == null || cardFromLibrary.description == undefined) ? "No Description Available" : cardFromLibrary.description.replace("[NEW_LINE]", " - ");

              //var isAttacking = creature.isDeclaredAttacker ? Constants.emoji_id.sword : '';
              //var isDefending = creature.isDeclaredDefender ? Constants.emoji_id.shield : '';
              var legendaryStatus = cardFromLibrary.legendary ? "- Legendary" : "";
              //var isTapped = card.isTapped ? `<:tapped:${Constants.emoji_id.tapped}> *(tapped)*` : ``;
              //var creatureStats = `${cardFromLibrary.power + Constants.getEquippedEnchantments("power", creature, battlefield["enchantments"])}/${cardFromLibrary.strength + Constants.getEquippedEnchantments("strength", creature, battlefield["enchantments"])}`;
              var isCreatureDisplayStatsString = cardFromLibrary.type == 'creature' ? `| ${cardFromLibrary.power}/${cardFromLibrary.strength}` : ``;

              emojiPairs[emojis[emoji_index]] = cardInHand;
              embed.addField(`${cardFromLibrary.type.capitalize()} ${legendaryStatus}`, `${emojis[emoji_index]} ${cardFromLibrary.card_name} ${isCreatureDisplayStatsString}`, false);
              emoji_index++;
            }*/
        });
      }
    //}

    var keys = Object.keys(emojiPairs);

    if (keys.length <= 0)
      return [];

    var message = await obj.message.channel.send({embed});


    for (i = 0; i < keys.length; i++)
    {
      //var emoji = Constants.client.emojis.get("name", emojis[i]);
      message.react(emojis[i]);
    }

    if (amount > keys.length)
    {
      amount = keys.length;
    }

    await message.awaitReactions(filter, { max: amount, time: local.reactionTimes.chooseTarget, errors: ['time'] })
        .then(collected => {
          try {
            const reactions = collected.array();
              /*var cardObj = [];
              for (i = 0; i < reactions.length; i++)
              {
                  var emojiIndex = emojis.indexOf(reactions[i]);
                  cardObj.push(currentHand.hand[emojiIndex]);
              }*/

              for (i = 0; i < reactions.length; i++)
              {
                //console.log(reactions[i]);

                var card = emojiPairs[reactions[i]._emoji.name];

                //console.log(card);

                if (!isHand)
                {
                  var indexOfCardOnBattlefield_creatures = battlefield["creatures"].indexOf(card);
                  var indexOfCardOnBattlefield_lands = battlefield["lands"].indexOf(card);
                  var indexOfCardOnBattlefield_enchantments = battlefield["enchantments"].indexOf(card);

                  if (indexOfCardOnBattlefield_creatures >= 0)
                    targets.push(battlefield["creatures"][indexOfCardOnBattlefield_creatures]);

                  if (indexOfCardOnBattlefield_lands >= 0)
                    targets.push(battlefield["lands"][indexOfCardOnBattlefield_lands]);

                  if (indexOfCardOnBattlefield_enchantments >= 0)
                    targets.push(battlefield["enchantments"][indexOfCardOnBattlefield_enchantments]);
                }
                else {
                    //var indexOfCardInHand = hand.hand.indexOf(card);
                    //if (indexOfCardInHand >= 0)
                      targets.push(card);
                }
                //creaturesToDeclare.push(currentBattlefield["creatures"][indexOfCardOnBattlefield].cardName);
                //currentBattlefield["creatures"][indexOfCardOnBattlefield].isDeclaredAttacker = attackerState;
                //currentBattlefield["creatures"][indexOfCardOnBattlefield].isDeclaredDefender = defenderState;
              }
          }
          catch (err)
          {
            console.log(err);
          }
        })
        .catch(collected => {
          //obj.message.channel.send("times up");
          //const reactions = collected.array();

          /*if (collected.size < 1)
          {
            //obj.message.reply(`targeting canceled. You only selected ${reactions.length} permanents out of ${amount}!`);
            return;
          }*/

        });

        //console.log(targets);

    return targets;
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
