const Constants = require('../util/Constants');
const HandleFunctionCall = require('../HandleFunctionCall');
const HandleConnection = require('../handle/HandleConnection');

var local = {
  nextphase:async function(cmd, args) {

    var msgOwnerID = cmd.author.id;
    var channelId = cmd.channel.id;

    var obj = {
      id: msgOwnerID,
      messageObj: cmd,
      callback: local.afterCheckUser
    };

    Constants.SQL.emit('check-user-exists', obj)
  },

  endturn:async function(cmd, args) {

    var msgOwnerID = cmd.author.id;
    var channelId = cmd.channel.id;

    var obj = {
      id: msgOwnerID,
      messageObj: cmd,
      messageArgs: args,
      callback: local.afterCheckUser,
      optional_param: ["1"]
    };

    Constants.SQL.emit('check-user-exists', obj)
  },

  afterCheckUser:async function(obj)
  {
    if (obj.result.length < 1)
      return;

    if (obj.result[0].mtg_user.mtg_reset == 1) {
      obj.message.reply(" you were killed recently. You must first get a new deck with \`m!begin\` before trying to play!");
      return;
    }

    if (Constants.commandRequests.includes(obj.id))
      return Constants.MessageCodes.USER_TASK_EXISTS;

    Constants.pushIDRequest(obj.id);

    var phases = {
      "1": local.goToPhaseOne,
      "2": local.goToPhaseTwo,
      "3": local.goToPhaseThree
    };

    var gameData = await HandleConnection.callDBFunction("MYSQL-returnQuery", "SELECT * FROM mtg_gamedata WHERE mtg_userID=\'" + obj.id + "\'");
    var gameDataObj = gameData[0].mtg_gamedata;

    if (obj.param != null && obj.param[0] != undefined)
    {
      var phaseNum = obj.param[0];
      obj.message.reply(` phase ${phaseNum}!`);
      await phases[String(phaseNum)](obj, gameDataObj);

      return;
    }

    //var userData = await HandleConnection.callDBFunction("MYSQL-returnQuery", "SELECT * FROM mtg_gamedata WHERE mtg_userID=\'" + obj.id + "\'");

    var phaseNum = gameDataObj.mtg_currentPhase < 3 ? gameDataObj.mtg_currentPhase + 1 : 1;
    //console.log(phaseNum);
    obj.message.reply(` phase ${phaseNum}!`);
    await phases[String(phaseNum)](obj, gameDataObj);
  },

  goToPhaseThree:async function(obj, gameDataObj)
  {
    var query = `UPDATE mtg_gamedata SET mtg_currentPhase='3' WHERE mtg_userID='${obj.id}'`;
    await HandleConnection.callDBFunction("MYSQL-fireAndForget", query);
  },

  goToPhaseOne:async function(obj, gameDataObj)
  {
    //Constants.pushIDRequest(obj.id);
    var currentHand = JSON.parse(gameDataObj.mtg_currentHand);
    var currentBattlefield = JSON.parse(gameDataObj.mtg_currentBattlefield);

    currentBattlefield["lands"].forEach(function(land){
      land.isTapped = false;
    });

    currentBattlefield["creatures"].forEach(function(creature)
    {
      var cardFromLibrary = Constants.cards.filter(search => search.ID == creature.cardID)[0];
      creature.isTapped = false;
      creature.power = cardFromLibrary.power; //+ Constants.getEquippedEnchantments("power", creature, currentBattlefield["enchantments"]);
      creature.strength = cardFromLibrary.strength; //+ Constants.getEquippedEnchantments("strength", creature, currentBattlefield["enchantments"]);
    });

    if (currentHand.hand.length > Constants.maximumHandSize)
    {
      var emojis = Constants.emoji_letters.slice(0, currentHand.hand.length);
      var emojiPairs = {};

      const filter = (reaction, user) => {
        //console.log(reaction);
        return emojis.includes(reaction._emoji.name) && user.id == obj.id;
      };

      //console.log(emojis);

      var cardDifference = currentHand.hand.length - Constants.maximumHandSize;
      obj.message.reply(` you must discard ${cardDifference} card(s), otherwise they will be discarded at random.`)

      const embed = new Constants.Discord.MessageEmbed()
      //console.log(obj.result[0].mtg_startingDeck);
      .setTitle(obj.message.author.username + "\'s Hand")
      .setColor(Constants.color_codes[obj.result[0].mtg_user.mtg_startingDeck])
      //.addField("Total Number of Cards", currentHand.hand.length, true)
      //.addField("Total Size of Deck", currentDeck.deck.length, true);
      for (i = 0; i < currentHand.hand.length; i++)
      {
          var card = null;
          var mana_cost = null;//JSON.parse(card.mana_cost);
          var mana_string = "";

          if (currentHand.hand[i].startsWith("MTG"))
          {
            card = Constants.cards.filter(search => search.ID == currentHand.hand[i])[0];

            mana_cost = JSON.parse(card.mana_cost);
            mana_string = Constants.getManaString(mana_cost);
          }
          else
            card = Constants.lands.filter(search => search.ID == currentHand.hand[i])[0];

          emojiPairs[emojis[i]] = card.ID;

          embed.addField(card.ID.startsWith("LAND") ? "land" : card.type, card.ID.startsWith("LAND") ? `${emojis[i]}(${card.ID.substring(5, card.ID.length)}) ${Constants.returnSingleManaByColor(card.colors)}${card.land}` : `${emojis[i]} (${card.ID.substring(4, card.ID.length)}) ${mana_string}${card.card_name} | ${card.power}/${card.strength}`, false);
        }

      var message = await obj.message.channel.send({embed});

      for (i = 0; i < currentHand.hand.length; i++)
      {
        //var emoji = Constants.client.emojis.get("name", emojis[i]);
        message.react(emojis[i]);
      }

      var removedCards = [];

      await message.awaitReactions(filter, { max: cardDifference, time: Constants.reactionTimes.discard, errors: ['time'] })
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

                  var cardID = emojiPairs[reactions[i]._emoji.name];
                  if (cardID.startsWith("MTG"))
                  {
                    var card = Constants.cards.filter(search => search.ID == cardID)[0];
                    removedCards.push(card.ID);
                  }
                  else if (cardID.startsWith("LAND"))
                  {
                    var card = Constants.lands.filter(search => search.ID == cardID)[0];
                    removedCards.push(card.ID);
                  }

                  var indexOfCardInHand = currentHand.hand.indexOf(cardID);

                  if (indexOfCardInHand != -1)
                    currentHand.hand.splice(indexOfCardInHand, 1);
                }
                //Constants.removeIDRequest(obj.id);
            }
            catch (err)
            {
              //Constants.removeIDRequest(obj.id);
              console.log(err);
            }
            //Constants.removeIDRequest(obj.id);
          })
          .catch(collected => {
            //obj.message.channel.send("times up");
            const reactions = collected.array();

            for (i = 0; i < reactions.length; i++)
            {
              //console.log(reactions[i]);

              var cardID = emojiPairs[reactions[i]._emoji.name];
              if (cardID.startsWith("MTG"))
              {
                var card = Constants.cards.filter(search => search.ID == cardID)[0];
                removedCards.push(card.ID);
              }
              else if (cardID.startsWith("LAND"))
              {
                var card = Constants.lands.filter(search => search.ID == cardID)[0];
                removedCards.push(card.ID);
              }

              var indexOfCardInHand = currentHand.hand.indexOf(cardID);

              if (indexOfCardInHand != -1)
                currentHand.hand.splice(indexOfCardInHand, 1);
            }

            var randomCardAmountToDiscard = cardDifference - reactions.length;

            for (x = 0; x < randomCardAmountToDiscard; x++)
            {
              var randomCardInHandArray = currentHand.hand.filter(cardInHand => !removedCards.includes(cardInHand));
              var randomIndex = randomCardInHandArray[Math.floor((Math.random() * randomCardInHandArray.length))];

              var chosenCardIndex = currentHand.hand.indexOf(randomIndex);
              removedCards.push(currentHand.hand[chosenCardIndex]);
              currentHand.hand.splice(chosenCardIndex, 1);
            }
            /*console.log(`After a minute, only ${collected.size} out of 4 reacted.`);
            obj.message.channel.send( "<@" + obj.id + "> you didn\'t select a deck!");
            var indexOfRequest = beginRequests.indexOf(obj.id);
            beginRequests.splice(indexOfRequest, 1);*/

              //Constants.removeIDRequest(obj.id);
          });

          await Constants.displayRemovedCards(obj, removedCards);
    }
    else {
      //Constants.removeIDRequest(obj.id);
    }

    //message.awaitReactions(filter, { max: 1, time: 60000, errors: ['time', 'duplicate'] })
    var query = `UPDATE mtg_gamedata SET mtg_currentPhase='1', mtg_allowedCardDraw='1', mtg_allowedLandCast='1', mtg_currentHand='${JSON.stringify(currentHand)}', mtg_currentBattlefield='${JSON.stringify(currentBattlefield)}' WHERE mtg_userID='${obj.id}'`;
    await HandleConnection.callDBFunction("MYSQL-fireAndForget", query);
  },

  goToPhaseTwo:async function(obj, gameDataObj)
  {
    var query = `UPDATE mtg_gamedata SET mtg_currentPhase='2' WHERE mtg_userID='${obj.id}'`;
    await HandleConnection.callDBFunction("MYSQL-fireAndForget", query);
  }
}

module.exports = local;
HandleFunctionCall.RegisterFunction(["n", "next", "nextphase"], local.nextphase);
HandleFunctionCall.RegisterFunction(["e", "et", "end", "endturn", "nt", "nextturn"], local.endturn);
