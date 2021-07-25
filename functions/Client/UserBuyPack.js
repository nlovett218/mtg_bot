/*
var cardsAlreadyFiltered = [];
var filteredCards = [];

for (i = 0; i < currentBattlefield["creatures"].length; i++)
{
  var battlefield = currentBattlefield["creatures"];
  var creature = battlefield[i];

  if (!cardsAlreadyFiltered.includes(creature.fieldID))
  {

      //console.log("card not found");
    var cardMatches = battlefield.filter(f => f.cardID == creature.cardID && f.power == creature.power && f.strength == creature.strength && f.isDeclaredDefender == creature.isDeclaredDefender && f.isDeclaredAttacker == creature.isDeclaredAttacker);
    cardMatches.forEach(function(match) {
      cardsAlreadyFiltered.push(match.fieldID);
    });
    filteredCards.push(cardMatches);
  }
}

for(x = 0; x < filteredCards.length; x++)
{
  var card = filteredCards[x][0];
  var cardFromLibrary = Constants.cards.filter(search => search.ID == card.cardID)[0];
  var amount = filteredCards[x].length;
  var isAttacking = card.isDeclaredAttacker ? Constants.emoji_id.sword : '';
  var isDefending = card.isDeclaredDefender ? Constants.emoji_id.shield : '';
  embed.addField('Creature', `x${amount} ${cardFromLibrary.card_name} ${card.power}/${card.strength} ${isAttacking}${isDefending}`, false);
}
*/
const Constants = require('../util/Constants');
const HandleFunctionCall = require('../HandleFunctionCall');
const HandleConnection = require('../handle/HandleConnection');

var local = {
  buypack:async function(cmd, args) {
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
      obj.message.reply(" you were killed recently. You must first get a new deck with \`m!begin\` before trying to purchase packs!");
      return;
    }

    if (Constants.commandRequests.includes(obj.id))
      return Constants.MessageCodes.USER_TASK_EXISTS;

    Constants.pushIDRequest(obj.id);

    var userDataObj = obj.result[0].mtg_user;
    var canceled = false;

    const filter = (reaction, user) => {
      //console.log(reaction);
      return [Constants.emoji_id.yes_mark, Constants.emoji_id.no_mark].includes(reaction._emoji.name) && user.id == obj.id;
    };

    var packsToBuy = obj.args[1] == null ? 1 : parseInt(obj.args[1]);

    //console.log(typeof(packsToOpen));
    if (Constants.isNumber(packsToBuy))
      packsToBuy = 1;

    if (packsToBuy > Constants.maxAllowedPurchasePacks)
    {
      await obj.message.reply(`the maximum amount of packs you can buy at one time is ${Constants.maxAllowedPurchasePacks}!`);
      //Constants.removeIDRequest(obj.id);
      return;
    }

    /*if (parseInt(userDataObj.mtg_packs) < packsToBuy)
    {
      await obj.message.reply(`you don't have ${packsToBuy} pack(s) that you can open!`);
      Constants.removeIDRequest(obj.id);
      return;
    }*/

    var totalPackCost = (packsToBuy * Constants.packCost);

    if (totalPackCost > userDataObj.mtg_currency)
    {
      await obj.message.reply(`you need another <:currency:${Constants.emoji_id.currency}> ${totalPackCost - userDataObj.mtg_currency} MB to buy that many packs. You only have <:currency:${Constants.emoji_id.currency}> ${userDataObj.mtg_currency} MB!`);
      //Constants.removeIDRequest(obj.id);
      return;
    }

    var message = await obj.message.channel.send(`<@${obj.id}> -> Are you sure you want to buy ${packsToBuy} pack(s)?\n` +
`Single Price of 1 Pack: <:currency:${Constants.emoji_id.currency}> ${Constants.packCost} MB\n` +
`Total Price of ${packsToBuy} Pack(s): <:currency:${Constants.emoji_id.currency}> ${totalPackCost} MB\n` +
`Amount Left after Transaction: <:currency:${Constants.emoji_id.currency}> ${parseInt(userDataObj.mtg_currency) - totalPackCost} MB`);

    message.react(Constants.emoji_id.yes_mark);
    message.react(Constants.emoji_id.no_mark);

    var canceled = false;

    await message.awaitReactions(filter, { max: 1, time: Constants.reactionTimes.purchasePack, errors: ['time'] })
        .then(async collected => {
          try {
          const reactions = collected.array();

          confirmPurchase = reactions[0]._emoji.name == Constants.emoji_id.yes_mark ? true : null;

          if (confirmPurchase == null)
          {
            message.edit(`<@${obj.id}> -> canceled purchasing pack(s).`);
            //Constants.removeIDRequest(obj.id);
            return;
          }

          if (confirmPurchase)
          {
            //var gameData = await HandleConnection.callDBFunction(`MYSQL-returnQuery`, `SELECT * FROM mtg_gamedata WHERE mtg_userID=\'${obj.id}\'`);
            //var gameDataObj = gameData[0].mtg_gamedata;
            //var currentDeck = JSON.parse(gameDataObj.mtg_currentDeck);

            message.edit(`<@${obj.id}> -> you just purchased ${packsToBuy} pack(s)!`);

            var packs_update = userDataObj.mtg_packs + packsToBuy;
            var currencyUpdate = userDataObj.mtg_currency - totalPackCost;
            //currentDeck.deck = Constants.shuffle(currentDeck.deck);

            var updateUserDataQuery = `UPDATE mtg_user SET mtg_packs='${packs_update}', mtg_currency='${currencyUpdate}' WHERE mtg_userID='${obj.id}'`;
            //var updateGameDataQuery = `UPDATE mtg_gamedata SET mtg_currentDeck='${JSON.stringify(currentDeck)}' WHERE mtg_userID='${obj.id}'`;
            await HandleConnection.callDBFunction('MYSQL-fireAndForget', updateUserDataQuery);
            //Constants.SQL.emit('client-update-sql', updateGameDataQuery);
            await Constants.action_gain_xp_currency(obj, 0 + (25 * packsToBuy));

          }
          else
          {
            canceled = true;
            message.edit(`<@${obj.id}> -> canceled purchasing pack(s).`);
          }
        }
        catch (err)
        {
          console.log(err);
        }

          //Constants.removeIDRequest(obj.id);
        })
        .catch(collected => {
            canceled = true;
            message.edit(`<@${obj.id}> -> canceled purchasing pack(s).`);
            //Constants.removeIDRequest(obj.id);
        });

    if (canceled)
      return;

  }
}

module.exports = local;
HandleFunctionCall.RegisterFunction(["purchase", "buy", "bp", "buypack"], local.buypack);
