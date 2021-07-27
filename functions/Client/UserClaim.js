const Constants = require('../util/Constants');
const HandleFunctionCall = require('../HandleFunctionCall');
const HandleConnection = require('../handle/HandleConnection');

var local = {
  claim:async function(cmd, args) {

    //cmd.reply(' this command is currently not enabled.')
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
    var owner = await obj.message.guild.members.fetch(obj.id);

    //console.log(owner)

    var roleTiers = await Constants.getRoleTiers(obj.message.guild, owner);

    if (obj.result.length < 1)
      return;

    if (obj.result[0].mtg_user.mtg_reset == 1) {
      obj.message.reply(" you were killed recently. You must first get a new deck with \`m!begin\` before trying to claim!");
      return;
    }

    if (Constants.commandRequests.includes(obj.id))
      return Constants.MessageCodes.USER_TASK_EXISTS;



    var userDataObj = obj.result[0].mtg_user;
    var guildID = obj.message.guild.id;
    var guilds = JSON.parse(userDataObj.mtg_guilds);
    var guildObjID = `${Constants.guildPrefix}${guildID}`;

    if (guilds[guildObjID] == undefined || guilds[guildObjID].optedInToServer == 0) {
      obj.message.reply(" you must first opt in before you can claim!");
      return;
    }

    if (roleTiers[0] == undefined) {
      obj.message.reply(" you do not have a Patreon role to claim any packs!");
      return;
    }

    if (roleTiers[0] == null) {
      obj.message.reply(" you do not have a Patreon role to claim any packs!");
      return;
    }

    var canClaim = false;
    var packAmountToReceive = roleTiers[0].extraPacks;//userDataObj.mtg_accountType.includes('ALPHA_TESTER') || userDataObj.mtg_accountType.includes('BOT_ADMIN') ? Constants.extraWeeklyPackAward : Constants.baseWeeklyPackAward;
    if (userDataObj.mtg_claimCooldown == null || userDataObj.mtg_claimCooldown == undefined)
    {
      canClaim = true;
    }
    else {
      var mtg_claimCooldown = new Date(userDataObj.mtg_claimCooldown);
      var timeSinceLastClaim = new Date(mtg_claimCooldown);
      var timeToAllowClaim = Date.parse(new Date(Constants.moment(timeSinceLastClaim).add(Constants.claimCooldown, 'minutes').format(Constants.momentTimeFormat)));//new Date(Constants.moment(timeSinceLastDraw).add(10, 'minutes').format("YYYY-MM-DD h:mm:ss"));
      var now = Date.now();

      if (timeToAllowClaim <= now) {
        canClaim = true;
      }
      else {
        var timeDifference = Constants.getTimeBetween(timeToAllowClaim, now);
        var timeString = `${parseInt(timeDifference.days.toFixed()).pad()} days + ${parseInt(timeDifference.hours.toFixed()).pad()}:${parseInt(timeDifference.minutes.toFixed()).pad()}:${parseInt(timeDifference.seconds.toFixed()).pad()}`;
        obj.message.reply(` you still have another \`${timeString}\` until you can claim your patreon pack(s)!`);
        canClaim = false;
      }
    }

    if (canClaim) {
      //var updateGameDataQuery = `UPDATE mtg_gamedata SET mtg_currentDeck='${JSON.stringify(currentDeck)}' WHERE mtg_userID='${obj.id}';`;
      var packs_update = userDataObj.mtg_packs + packAmountToReceive;
      var updateUserDataQuery = `UPDATE mtg_user SET mtg_claimCooldown=STR_TO_DATE('${Constants.moment(now).format(Constants.momentTimeFormat)}', '%m-%d-%Y %H:%i:%s'), mtg_packs='${packs_update}' WHERE mtg_userID='${obj.id}'`;

      await HandleConnection.callDBFunction('MYSQL-fireAndForget', updateUserDataQuery);
      await obj.message.channel.send(`<@${obj.id}> -> you successfully claimed your ${packAmountToReceive} extra pack(s) for being a patreon!`);
      await Constants.action_gain_xp_currency(obj, 0);
      //Constants.SQL.emit('client-update-sql', updateGameDataQuery);
    }



    Constants.removeIDRequest(obj.id);
  }
}


module.exports = local;
HandleFunctionCall.RegisterFunction(["c", "cl", "claim"], local.claim);
