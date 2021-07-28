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
  openpack:async function(cmd, args) {
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
      obj.message.reply(" you were killed recently. You must first get a new deck with \`m!begin\` before trying to open packs!");
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

    var packsToOpen = obj.args[1] == null ? 1 : parseInt(obj.args[1]);

    //console.log(typeof(packsToOpen));
    if (Constants.isNumber(packsToOpen))
      packsToOpen = 1;

    if (packsToOpen > Constants.maxAllowedRedeemPacks)
    {
      await obj.message.reply(`the maximum amount of packs you can open at one time is ${Constants.maxAllowedRedeemPacks}!`);
      //Constants.removeIDRequest(obj.id);
      return;
    }

    if (parseInt(userDataObj.mtg_packs) < packsToOpen)
    {
      await obj.message.reply(`you don't have ${packsToOpen} pack(s) that you can open!`);
      //Constants.removeIDRequest(obj.id);
      return;
    }
    var message = await obj.message.channel.send(`<@${obj.id}> -> Are you sure you want to open ${packsToOpen} pack(s)?`);

    message.react(Constants.emoji_id.yes_mark);
    message.react(Constants.emoji_id.no_mark);

    var canceled = false;

    await message.awaitReactions(filter, { max: 1, time: Constants.reactionTimes.openPack, errors: ['time'] })
        .then(async collected => {
          try {
          const reactions = collected.array();

          var confirmOpen = reactions[0]._emoji.name == Constants.emoji_id.yes_mark ? true : null;

          if (confirmOpen == null)
          {
            message.edit(`<@${obj.id}> -> canceled opening pack(s).`);
            //Constants.removeIDRequest(obj.id);
            return;
          }

          if (confirmOpen)
          {
            var gameData = await HandleConnection.callDBFunction(`MYSQL-returnQuery`, `SELECT * FROM mtg_gamedata WHERE mtg_userID=\'${obj.id}\'`);
            var gameDataObj = gameData[0].mtg_gamedata;
            var currentDeck = JSON.parse(gameDataObj.mtg_currentDeck);

            message.edit(`<@${obj.id}> -> you just opened ${packsToOpen} pack(s)!`);

            for(packNum = 0; packNum < packsToOpen; packNum++) {

              var cardsReceived = [];
              var cardsAlreadyFiltered = [];
              var filteredCards = [];
              var receivedCardsString = "";

              for(i = 0; i < Constants.packAmounts.guaranteed_lands; i++)
              {
                var land = Constants.lands[Math.floor((Math.random() * Constants.lands.length))];
                cardsReceived.push(land.ID);
              }

              for(i = 0; i < Constants.packAmounts.guaranteed_commons; i++)
              {
                var cards = Constants.cards.filter(search => search.rarity.toLowerCase() == 'common');
                var card = cards[Math.floor((Math.random() * cards.length))];
                cardsReceived.push(card.ID);
              }

              for(i = 0; i < Constants.packAmounts.guaranteed_uncommons; i++)
              {
                var cards = Constants.cards.filter(search => search.rarity.toLowerCase() == 'uncommon');
                var card = cards[Math.floor((Math.random() * cards.length))];
                cardsReceived.push(card.ID);
              }

              for(i = 0; i < Constants.packAmounts.guaranteed_rare_mythic; i++)
              {
                var cards = Constants.cards.filter(search => search.rarity.toLowerCase() == 'rare' || search.rarity.toLowerCase() == 'mythic');
                var card = cards[Math.floor((Math.random() * cards.length))];
                cardsReceived.push(card.ID);
              }

              for (i = 0; i < cardsReceived.length; i++)
              {
                var card = cardsReceived[i];
                currentDeck.deck.push(card);

                if (!cardsAlreadyFiltered.includes(card))
                {

                    //console.log("card not found");
                  var cardMatches = cardsReceived.filter(f => f == card);
                  /*cardMatches.forEach(function(match) {
                    cardsAlreadyFiltered.push(match.ID);
                  });*/
                  cardsAlreadyFiltered.push(card);
                  filteredCards.push(cardMatches);
                }
              }

              for(x = 0; x < filteredCards.length; x++)
              {
                var card = filteredCards[x][0];
                var cardFromLibrary = card.startsWith("LAND") ? Constants.lands.filter(search => search.ID == card)[0] : Constants.cards.filter(search => search.ID == card)[0];
                var cardName = cardFromLibrary.ID.startsWith("LAND") ? cardFromLibrary.land : cardFromLibrary.card_name;
                var amount = filteredCards[x].length;
                var mana_cost = cardFromLibrary.ID.startsWith("LAND") ? null : JSON.parse(cardFromLibrary.mana_cost);
                var mana_string = cardFromLibrary.ID.startsWith("LAND") ? Constants.returnManaByColorTable(cardFromLibrary.colors) : Constants.getManaString(mana_cost);
                var rarity_string = cardFromLibrary.ID.startsWith("LAND") ? `(land)` : `(<:${cardFromLibrary.rarity}:${Constants.emoji_id[cardFromLibrary.rarity]}>)`;
                //var isAttacking = card.isDeclaredAttacker ? Constants.emoji_id.sword : '';
                //var isDefending = card.isDeclaredDefender ? Constants.emoji_id.shield : '';
                //embed.addField('Creature', `x${amount} ${cardFromLibrary.card_name} ${card.power}/${card.strength} ${isAttacking}${isDefending}`, false);
                receivedCardsString += `${amount}x ${mana_string} ${cardName} ${rarity_string}\n`;
              }

              obj.message.channel.send(`<@${obj.id}> -> Pack ${packNum + 1} of ${packsToOpen}:\n\n${receivedCardsString}`);
            }

            var packs_update = userDataObj.mtg_packs - packsToOpen;
            currentDeck.deck = Constants.shuffle(currentDeck.deck);

            var updateUserDataQuery = `UPDATE mtg_user SET mtg_packs='${packs_update}' WHERE mtg_userID='${obj.id}'`;
            var updateGameDataQuery = `UPDATE mtg_gamedata SET mtg_currentDeck='${JSON.stringify(currentDeck)}' WHERE mtg_userID='${obj.id}'`;
            await HandleConnection.callDBFunction('MYSQL-fireAndForget', updateUserDataQuery);
            await HandleConnection.callDBFunction('MYSQL-fireAndForget', updateGameDataQuery);
            await Constants.action_gain_xp_currency(obj, 0 + (25 * packsToOpen));

          }
          else
          {
            canceled = true;
            message.edit(`<@${obj.id}> -> canceled opening pack(s).`);
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
            message.edit(`<@${obj.id}> -> canceled opening pack(s).`);
            //Constants.removeIDRequest(obj.id);
        });

    if (canceled)
      return;

  }
}

module.exports = local;
HandleFunctionCall.RegisterFunction(["o", "op", "open", "pack", "openpack"], local.openpack);
