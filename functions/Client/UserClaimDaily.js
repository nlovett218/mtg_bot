/*var updateGameDataQuery = `UPDATE mtg_gamedata SET mtg_currentDeck='${JSON.stringify(currentDeck)}' WHERE mtg_userID='${obj.id}';`;
var updateUserDataQuery = `UPDATE mtg_user SET mtg_wildcards='${JSON.stringify(wildcards)}' WHERE mtg_userID='${obj.id}'`;

Constants.SQL.emit('client-update-sql', updateUserDataQuery);
Constants.SQL.emit('client-update-sql', updateGameDataQuery);*/

const Constants = require('../util/Constants');
const HandleFunctionCall = require('../HandleFunctionCall');
const HandleConnection = require('../handle/HandleConnection');

var local = {
  claimdailypack:async function(cmd, args) {
    var msgOwnerID = cmd.author.id;
    var channelId = cmd.channel.id;

    var obj = {
      id: msgOwnerID,
      messageObj: cmd,
      messageArgs: args,
      callback: local.afterCheckUser
    };

    Constants.SQL.emit('check-user-exists', obj)

  },

  afterCheckUser:async function(obj)
  {

    if (obj.result.length < 1)
      return;

    if (obj.result[0].mtg_user.mtg_reset == 1) {
      obj.message.reply(" you were killed recently. You must first get a new deck with \`m!begin\` before trying to claim!");
      return;
    }

    if (Constants.commandRequests.includes(obj.id))
      return Constants.MessageCodes.USER_TASK_EXISTS;

    Constants.pushIDRequest(obj.id);

    var userDataObj = obj.result[0].mtg_user;
    var guildID = obj.message.guild.id;
    var guilds = JSON.parse(userDataObj.mtg_guilds);
    var guildObjID = `${Constants.guildPrefix}${guildID}`;

    if (guilds[guildObjID] == undefined || guilds[guildObjID].optedInToServer == 0) {
      obj.message.reply(" you must first opt in before you can claim!");
      return;
    }

    var canClaim = false;
    var packAmountToReceive = userDataObj.mtg_accountType.includes('ALPHA_TESTER') || userDataObj.mtg_accountType.includes('BOT_ADMIN') ? Constants.extraDailyPackAward : Constants.baseDailyPackAward;
    if (userDataObj.mtg_dailyPackCooldown == null || userDataObj.mtg_dailyPackCooldown == undefined)
    {
      canClaim = true;
    }
    else {
      var mtg_dailyPackCooldown = new Date(userDataObj.mtg_dailyPackCooldown);
      var timeSinceLastClaim = new Date(mtg_dailyPackCooldown);
      var timeToAllowClaim = Date.parse(new Date(Constants.moment(timeSinceLastClaim).add(Constants.dailyCooldown, 'minutes').format(Constants.momentTimeFormat)));//new Date(Constants.moment(timeSinceLastDraw).add(10, 'minutes').format("YYYY-MM-DD h:mm:ss"));
      var now = Date.now();

      if (timeToAllowClaim <= now) {
        canClaim = true;
      }
      else {
        var timeDifference = Constants.getTimeBetween(timeToAllowClaim, now);
        var timeString = `${parseInt(timeDifference.hours.toFixed()).pad()}:${parseInt(timeDifference.minutes.toFixed()).pad()}:${parseInt(timeDifference.seconds.toFixed()).pad()}`;
        obj.message.reply(` you still have another \`${timeString}\` until you can claim your daily pack(s)!`);
        canClaim = false;
      }
    }

    if (canClaim) {
      //var updateGameDataQuery = `UPDATE mtg_gamedata SET mtg_currentDeck='${JSON.stringify(currentDeck)}' WHERE mtg_userID='${obj.id}';`;
      var packs_update = userDataObj.mtg_packs + packAmountToReceive;
      var updateUserDataQuery = `UPDATE mtg_user SET mtg_dailyPackCooldown=STR_TO_DATE('${Constants.moment(now).format(Constants.momentTimeFormat)}', '%m-%d-%Y %H:%i:%s'), mtg_packs='${packs_update}' WHERE mtg_userID='${obj.id}'`;

      await HandleConnection.callDBFunction('MYSQL-fireAndForget', updateUserDataQuery);
      await obj.message.channel.send(`<@${obj.id}> -> you successfully claimed your ${packAmountToReceive} daily pack(s)!`);
      await Constants.action_gain_xp_currency(obj, 0);
      //Constants.SQL.emit('client-update-sql', updateGameDataQuery);
    }

    Constants.removeIDRequest(obj.id);
  }
}


module.exports = local;
HandleFunctionCall.RegisterFunction(["dly", "daily", "claimdaily"], local.claimdailypack);
