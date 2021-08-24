const Constants = require('../util/Constants');
const HandleFunctionCall = require('../HandleFunctionCall');
const HandleConnection = require('../handle/HandleConnection');

function CodeHasExpired(expireTimestamp)
{
  var now = Date.now();

  if (expireTimestamp != null && expireTimestamp != undefined) {
      var expireDate = new Date(expireTimestamp);
      //var timeToAllowAttack = Date.parse(new Date(Constants.moment(mtg_lastAttackDateTime).add(Constants.attackCooldown, 'minutes').format(Constants.momentTimeFormat)));
      var expireTime = Date.parse(new Date(Constants.moment(expireDate).format(Constants.momentTimeFormat)));
      var expireTimeDifference = Constants.getTimeBetween(expireTime, now);
      //var timeString = `${parseInt(attackTimeDifference.hours.toFixed()).pad()}:${parseInt(attackTimeDifference.minutes.toFixed()).pad()}:${parseInt(attackTimeDifference.seconds.toFixed()).pad()}`;
      //AttackCooldown = timeToAllowAttack <= now ? "READY" : timeString;
      return expireTime <= now;
  }

  return true;
}

function CodeHasBeenRedeemed(redeemer)
{
  return redeemer != null;
}

async function ConfirmRedeemCode(obj)
{
  const filter = (reaction, user) => {
    //console.log(reaction);
    return [Constants.emoji_id.yes_mark, Constants.emoji_id.no_mark].includes(reaction._emoji.name) && user.id == obj.id;
  };

  var message = await obj.message.channel.send(`Are you sure you want to redeem this code? Items cannot be transferred after use.`);

  message.react(Constants.emoji_id.yes_mark);
  message.react(Constants.emoji_id.no_mark);

  var canceled = false;
  var confirm = false;

    await message.awaitReactions(filter, { max: 1, time: Constants.reactionTimes.openPack, errors: ['time'] })
        .then(async collected => 
        {
          try 
          {
              const reactions = collected.array();

              var confirmOpen = reactions[0]._emoji.name == Constants.emoji_id.yes_mark ? true : null;

              if (confirmOpen == null)
              {
                //message.delete(`Redeem`);
                //Constants.removeIDRequest(obj.id);
                canceled = true;
                //message.delete();
                return;
              }

              if (confirmOpen)
              {
                confirm = true;
                //message.delete();
              }
          }
          catch (err)
          {
            console.log(err);
            //message.delete();
          }

            //Constants.removeIDRequest(obj.id);
          })
          .catch(collected => {
              canceled = true;
              //message.delete();
              //Constants.removeIDRequest(obj.id);
          });

  message.delete();

  return confirm;
}

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

  redeempurchase:async function(cmd, args) {

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

  ProcessCodeRedemption:async function(obj, key)
  {
    if (obj.message.channel.type != 'dm') {
      obj.message.delete();
      return obj.message.reply("this command only works in DM's!");
    }

    //obj.message.reply("Testing code redemption");

    var userDataObj = obj.result[0].mtg_user;

    var wildcards = JSON.parse(userDataObj.mtg_wildcards);

    //console.log(key);

    var getKeySQLQuery = `SELECT * FROM ${Constants.PURCHASE_TABLE} WHERE CODE = '${key}'`;
    var keyResult = await Constants.HandleConnection.callDBFunction("MYSQL-returnQuery", getKeySQLQuery);

    if (keyResult.length < 1)
      return obj.message.reply("You entered an invalid code!");

    //if (keyResult)

    var purchaseData = keyResult[0].mtg_purchases;

    if (CodeHasBeenRedeemed(purchaseData.REDEEMER_USER_ID))
      return obj.message.reply("Sorry this code has already been redeemed!");

    if (CodeHasExpired(purchaseData.EXPIRES))
      return obj.message.reply("Sorry this code has expired!");

    var confirmRedeem = await ConfirmRedeemCode(obj);

    if (confirmRedeem)
    {

      var QUANTITY = purchaseData.QUANTITY;

      if (Constants.PURCHASE_TABLE_REWARDS[purchaseData.PRODUCT_ID] == null || Constants.PURCHASE_TABLE_REWARDS[purchaseData.PRODUCT_ID] == undefined)
        return obj.message.reply("Unfortunately, no rewards exist for this product code. Please contact the bot developer at magicthegatheringbot@gmail.com with your issue. Your product code has not been redeemed.")

      var wildcardRewards = Constants.PURCHASE_TABLE_REWARDS[purchaseData.PRODUCT_ID].wildcards;

      wildcards.common += (wildcardRewards.common * QUANTITY);
      wildcards.uncommon += (wildcardRewards.uncommon * QUANTITY);
      wildcards.rare += (wildcardRewards.rare * QUANTITY);
      wildcards.mythic += (wildcardRewards.mythic * QUANTITY);

      var redeemString = `Common Wildcards Received: <:common:831059903257903134> **${(wildcardRewards.common * QUANTITY)}**\n` +
      `Uncommon Wildcards Received: <:uncommon:831059879983841291> **${(wildcardRewards.uncommon * QUANTITY)}**\n` + 
      `Rare Wildcards Received: <:rare:831059869738074154> **${(wildcardRewards.rare * QUANTITY)}**\n` +
      `Mythic Rare Wildcards Received: <:mythic:831059862251241472> **${(wildcardRewards.mythic * QUANTITY)}**\n` +
      `\nThank you for your purchase! Please feel free to contact me at magicthegatheringbot@gmail.com if you have any issues!`;

      var totalPurchases = userDataObj.mtg_totalPurchases + QUANTITY;


      obj.message.reply(redeemString);

      var now = Date.now();

      var updateWildcardsQuery = `UPDATE mtg_user SET mtg_wildcards = '${JSON.stringify(wildcards)}', mtg_totalPurchases = ${totalPurchases} WHERE mtg_userID = '${obj.id}'`;
      var updatePurchaseDataQuery = `UPDATE ${Constants.PURCHASE_TABLE} SET REDEEMER_USER_ID = '${obj.id}', TIMESTAMP_REDEEMED=STR_TO_DATE('${Constants.moment(now).format(Constants.momentTimeFormat)}', '%m-%d-%Y %H:%i:%s') WHERE CODE = '${key}'`;

      await Constants.HandleConnection.callDBFunction("MYSQL-fireAndForget", updateWildcardsQuery);
      await Constants.HandleConnection.callDBFunction("MYSQL-fireAndForget", updatePurchaseDataQuery);
      //console.log(keyResult);
    }
  },

  afterCheckUser:async function(obj)
  {
    if (obj.message.channel.type == 'dm') 
    {
      if (obj.args[1] != null)
      {
        if (obj.args[1].toUpperCase().startsWith('MKOTD-'))
        {
          await local.ProcessCodeRedemption(obj, obj.args[1]);
          Constants.removeIDRequest(obj.id);
          return;
        }
      }

      return obj.message.reply(" you entered an invalid code!");
    }

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

    if (obj.args[0].toLowerCase().startsWith('m!code') || obj.args[0].toLowerCase().startsWith('m!key')) 
    {
      if (obj.args[1] != null)
      {
        if (obj.args[1].toUpperCase().startsWith('MKOTD-'))
        {
          await local.ProcessCodeRedemption(obj, obj.args[1]);
          Constants.removeIDRequest(obj.id);
          return;
        }
        else return obj.message.reply("this command only works in DM's!");
      }
      else return obj.message.reply("this command only works in DM's!");
    }


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
HandleFunctionCall.RegisterFunction(["code", "key"], local.redeempurchase);

