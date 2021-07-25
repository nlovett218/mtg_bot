const Constants = require('../util/Constants');
const HandleConnection = require('../handle/HandleConnection');
const HandleFunctionCall = require('../HandleFunctionCall');
const Canvas = require('canvas');
const snekfetch = require('snekfetch');

function getTierStringFromXP(xp)
{
  return Constants.returnTierByXP(xp) != null ? `${Constants.returnTierByXP(xp)["rank"]} ${Constants.returnTierByXP(xp)["tierText"]}` : `Bronze I`;
}

function getTierEmojiFromXP(xp)
{
  return Constants.returnTierByXP(xp) != null ? Constants.returnTierByXP(xp)["emoji_id"] : "556257417856286730";
}

async function displayInfo(obj, infoType) {
  Constants.pushIDRequest(obj.id);
  if (infoType == "playerinfo") {

    var authorID = null; //mentions[0].id;
    var userData = obj.result;
    var gameData = null;

    var mentions = await obj.message.mentions.members.array();

    if (mentions.length < 1)
    {
      authorID = obj.id;
      //obj.message.channel.send(`<@${obj.id}> -> you must mention the user to use this feature!`);
      //Constants.removeIDRequest(obj.id);
      //return;
      //userData = await HandleConnection.callDBFunction("MYSQL-returnQuery", "SELECT * FROM mtg_user WHERE mtg_userID=\'" + authorID + "\'");
      gameData = await HandleConnection.callDBFunction("MYSQL-returnQuery", "SELECT * FROM mtg_gamedata WHERE mtg_userID=\'" + authorID + "\'");
    }
    else {
      authorID = mentions[0].id;
      userData = await HandleConnection.callDBFunction("MYSQL-returnQuery", "SELECT * FROM mtg_user WHERE mtg_userID=\'" + authorID + "\'");
      gameData = await HandleConnection.callDBFunction("MYSQL-returnQuery", "SELECT * FROM mtg_gamedata WHERE mtg_userID=\'" + authorID + "\'");
      if (gameData == null || gameData.length < 1 || userData == null || userData.length < 1)
      {
        obj.message.channel.send(`<@${obj.id}> -> No user data was found for '${obj.args[1]}'!`);
        //Constants.removeIDRequest(obj.id);
        return;
      }
    }




    /*if (obj.args[1] != null) {
      if (obj.args[1].includes('<', '@', '>' ))
      {
        authorID = obj.args[1].slice(2); //remove the <@ characters before the ID
        authorID = authorID.substring(0, authorID.length - 1);
      }
      else if (obj.args[1].includes('@'))
      {
        authorID = authorID.slice(1);
      }

      userData = await HandleConnection.callDBFunction("MYSQL-returnQuery", "SELECT * FROM mtg_user WHERE mtg_userID=\'" + authorID + "\'");
      gameData = await HandleConnection.callDBFunction("MYSQL-returnQuery", "SELECT * FROM mtg_gamedata WHERE mtg_userID=\'" + authorID + "\'");

      if (gameData == null || gameData.length < 1 || userData == null || userData.length < 1)
      {
        obj.message.channel.send(`<@${obj.id}> -> No user data was found for '${obj.args[1]}'!`);
        return;
      }
    }
    else {
      gameData = await HandleConnection.callDBFunction("MYSQL-returnQuery", "SELECT * FROM mtg_gamedata WHERE mtg_userID=\'" + authorID + "\'");
    }*/

    var memberName = authorID;
    var member = null;

    try {
      member = await obj.message.guild.members.fetch(authorID);

      memberName = member.user.username;

      //console.log(memberName.user));
      //console.log(memberName);
    }
    catch (err)
    {
      console.log(err);
    }

    if (member == null && memberName != obj.id)
    {
      //obj.message.channel.send(`<@${obj.id}> -> No user data was found for '${obj.args[1]}'!`);
      //return;
      memberName = `<@${authorID}>`;
    }

    var userDataObj = userData[0].mtg_user;
    var tier = Constants.returnTierByXP(userDataObj.mtg_rankxp);
    var tierString = await getTierStringFromXP(userDataObj.mtg_rankxp);
    var tierEmoji = await getTierEmojiFromXP(userDataObj.mtg_rankxp);
    var mtg_guilds = JSON.parse(userDataObj.mtg_guilds);
    var guildID = obj.message.guild.id;
    var optInOutStatus = null;

    var guildObjID = Constants.guildPrefix + guildID;

    if (mtg_guilds[guildObjID] == null || mtg_guilds[guildObjID] == undefined)
    {
      optInOutStatus = `<:optedout:${Constants.emoji_id.optedout}>`;
    }
    else {
      optInOutStatus = mtg_guilds[guildObjID]["optedInToServer"] == 1 ? `<:optedin:${Constants.emoji_id.optedin}>` : `<:optedout:${Constants.emoji_id.optedout}>`;
    }

    var gameDataObj = gameData[0].mtg_gamedata;

    var packs = userDataObj.mtg_packs;
    var wildcards = JSON.parse(userDataObj.mtg_wildcards);

    var DrawCooldown = "READY";
    var AttackCooldown = "READY";
    var ClaimCooldown = "READY";
    var DailyCooldown = "READY";
    var WeeklyCooldown = "READY";




    //var now = Date.now();//Constants.moment().format("MM-DD-YYYY hh:mm:ss");
    var now = Date.now();


    if (userDataObj.mtg_lastAttackDateTime != null && userDataObj.mtg_lastAttackDateTime != undefined) {
      var mtg_lastAttackDateTime = new Date(userDataObj.mtg_lastAttackDateTime);
      var timeToAllowAttack = Date.parse(new Date(Constants.moment(mtg_lastAttackDateTime).add(Constants.attackCooldown, 'minutes').format(Constants.momentTimeFormat)));
      var attackTimeDifference = Constants.getTimeBetween(timeToAllowAttack, now);
      var timeString = `${parseInt(attackTimeDifference.hours.toFixed()).pad()}:${parseInt(attackTimeDifference.minutes.toFixed()).pad()}:${parseInt(attackTimeDifference.seconds.toFixed()).pad()}`;
      AttackCooldown = timeToAllowAttack <= now ? "READY" : timeString;
    }
    if (userDataObj.mtg_lastCardDrawnDateTime != null && userDataObj.mtg_lastCardDrawnDateTime != undefined) {
      var mtg_lastCardDrawnDateTime = new Date(userDataObj.mtg_lastCardDrawnDateTime);
      var timeToAllowDraw = Date.parse(new Date(Constants.moment(mtg_lastCardDrawnDateTime).add(Constants.drawCooldown, 'minutes').format(Constants.momentTimeFormat)));
      var drawTimeDifference = Constants.getTimeBetween(timeToAllowDraw, now);
      var timeString = `${parseInt(drawTimeDifference.hours.toFixed()).pad()}:${parseInt(drawTimeDifference.minutes.toFixed()).pad()}:${parseInt(drawTimeDifference.seconds.toFixed()).pad()}`;
      DrawCooldown = timeToAllowDraw <= now ? "READY" : timeString;
    }
    if (userDataObj.mtg_lastClaimDateTime != null && userDataObj.mtg_lastClaimDateTime != undefined) {
      var mtg_lastClaimDateTime = new Date(userDataObj.mtg_lastClaimDateTime);
      var timeToAllowClaim = Date.parse(new Date(Constants.moment(mtg_lastClaimDateTime).add(Constants.claimCooldown, 'minutes').format(Constants.momentTimeFormat)));
      var claimTimeDifference = Constants.getTimeBetween(timeToAllowClaim, now);
      var timeString = `${parseInt(claimTimeDifference.hours.toFixed()).pad()}:${parseInt(claimTimeDifference.minutes.toFixed()).pad()}:${parseInt(claimTimeDifference.seconds.toFixed()).pad()}`;
      ClaimCooldown = timeToAllowClaim <= now ? "READY" : timeString;
    }
    if (userDataObj.mtg_dailyPackCooldown != null && userDataObj.mtg_dailyPackCooldown != undefined) {
      var mtg_dailyPackCooldown = new Date(userDataObj.mtg_dailyPackCooldown);
      var timeToAllowDaily = Date.parse(new Date(Constants.moment(mtg_dailyPackCooldown).add(Constants.dailyCooldown, 'minutes').format(Constants.momentTimeFormat)));
      var dailyTimeDifference = Constants.getTimeBetween(timeToAllowDaily, now);
      var timeString = `${parseInt(dailyTimeDifference.hours.toFixed()).pad()}:${parseInt(dailyTimeDifference.minutes.toFixed()).pad()}:${parseInt(dailyTimeDifference.seconds.toFixed()).pad()}`;
      DailyCooldown = timeToAllowDaily <= now ? "READY" : timeString;
    }
    if (userDataObj.mtg_weeklyPackCooldown != null && userDataObj.mtg_weeklyPackCooldown != undefined) {
      var mtg_weeklyPackCooldown = new Date(userDataObj.mtg_weeklyPackCooldown);
      var timeToAllowWeekly = Date.parse(new Date(Constants.moment(mtg_weeklyPackCooldown).add(Constants.weeklyCooldown, 'minutes').format(Constants.momentTimeFormat)));
      var weeklyTimeDifference = Constants.getTimeBetween(timeToAllowWeekly, now);
      var timeString = `${parseInt(weeklyTimeDifference.days.toFixed()).pad()} days + ${parseInt(weeklyTimeDifference.hours.toFixed()).pad()}:${parseInt(weeklyTimeDifference.minutes.toFixed()).pad()}:${parseInt(weeklyTimeDifference.seconds.toFixed()).pad()}`;
      WeeklyCooldown = timeToAllowWeekly <= now ? "READY" : timeString;
    }

    //console.log(tier);
    //console.log(userData[0]);
    const embed = new Constants.Discord.MessageEmbed()
    //console.log(obj.result[0].mtg_startingDeck);
    .setTitle(`${optInOutStatus}__**${memberName}\'s Stats**__ | __**Tier:**__ ${tierString} ${tierEmoji}`)
    .setColor(Constants.color_codes["black"])
    .setDescription(`<:pack:${Constants.emoji_id.pack}>You have ${packs} pack(s) available to open.\n
    <:wildcard:${Constants.emoji_id.wildcard}>You have ${wildcards.common} common(s), ${wildcards.uncommon} uncommon(s), ${wildcards.rare} rare(s), ${wildcards.mythic} mythic rare(s) in your wildcard inventory.`)
    .setFooter(`XP Needed For Next Tier: ${parseInt(tier.maxXP - userDataObj.mtg_rankxp)} | Current Phase: ${gameDataObj.mtg_currentPhase}`)
    .addField(`${Constants.emoji_id.heart}Health`, userDataObj.mtg_health, true)
    .addField(`<:kill:${Constants.emoji_id.kill}>Kills`, userDataObj.mtg_kills, true)
    .addField(`${Constants.emoji_id.death}Deaths`, userDataObj.mtg_deaths, true)
    .addField(`<:currency:${Constants.emoji_id.currency}>Magic Beans`, userDataObj.mtg_currency, true)
    .addField(`${Constants.emoji_id.clock}Draw Cooldown`, `**\`${DrawCooldown}\`**`, true)
    .addField(`${Constants.emoji_id.clock}Attack Cooldown`, `**\`${AttackCooldown}\`**`, true)
    .addField(`${Constants.emoji_id.clock}Claim Cooldown`, `**\`${ClaimCooldown}\`**`, true)
    .addField(`${Constants.emoji_id.clock}Daily Pack Cooldown`, `**\`${DailyCooldown}\`**`, true)
    .addField(`${Constants.emoji_id.clock}Weekly Pack Cooldown`, `**\`${WeeklyCooldown}\`**`, true)
    //.addField("Health", userDataObj.mtg_health, true)

    obj.message.reply({embed});

  }
  else if (infoType == "cardinfo") {
    var authorID = obj.id;
    var card = null;
    var search = null;

    if (obj.args[1] != null) {
      search = Constants.returnClosestMatchToCard(obj.args.slice(1));
      //console.log(search);
    }
    else {
      obj.message.reply(` invalid card name!`);
      return;
      //gameData = await HandleConnection.callDBFunction("MYSQL-returnQuery", "SELECT * FROM mtg_gamedata WHERE mtg_userID=\'" + authorID + "\'");
    }

    if (search == null)
      return;

    /*var searchImageAccessible = false;

    if (Constants.imageFileLocations[`${search.cardID}${Constants.imageFileExtension}`] != undefined)
      searchImageAccessible = true;

    if (!searchImageAccessible)
    {
      obj.message.reply(` no artwork for this card exists! Unable to provide card info.`);
      return;
    }*/

    var attachment = await Constants.getCardArtwork(search);

    obj.message.channel.send(`<@${obj.id}> -> found match: **${search.cardName
    }**`, attachment);
  }
}

var local = {
  playerinfo:async function(cmd, args)
  {
    var msgOwnerID = cmd.author.id;
    var channelId = cmd.channel.id;

    var obj = {
      id: msgOwnerID,
      messageObj: cmd,
      messageArgs: args,
      callback: local.afterCheckUser,
      optional_param: ["playerinfo"]
    };

    Constants.SQL.emit('check-user-exists', obj)
  },

  cardinfo:async function(cmd, args)
  {
    var msgOwnerID = cmd.author.id;
    var channelId = cmd.channel.id;

    var obj = {
      id: msgOwnerID,
      messageObj: cmd,
      messageArgs: args,
      callback: local.afterCheckUser,
      optional_param: ["cardinfo"]
    };

    Constants.SQL.emit('check-user-exists', obj)
  },

  afterCheckUser:async function(obj) {
    if (obj.result.length < 1)
      return;

    //var callbackindex = Object.values(HandleFunctionCall.FunctionsList).indexOf(obj.callback);
    //var commandStrings = Object.keys(HandleFunctionCall.FunctionsList)[callbackindex];
    //var param = commandStrings.includes(obj.args[0].slice(2)) ? "playerinfo" : "cardinfo";
    //console.log(obj.callback);
    await displayInfo(obj, obj.param[0]);
  },
}


module.exports = local;
HandleFunctionCall.RegisterFunction(["info", "player", "stats", "st", "pl", "i", "s"], local.playerinfo);
HandleFunctionCall.RegisterFunction(["card", "cardinfo", "ci",], local.cardinfo);
