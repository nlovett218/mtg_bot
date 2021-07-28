const Constants = require('../util/Constants');
const HandleConnection = require('../handle/HandleConnection');
const HandleFunctionCall = require('../HandleFunctionCall');
const { forEach } = require('p-iteration');

async function discardCards(obj, amount, deck, hand)
{
  var emojis = Constants.emoji_letters.slice(0, hand.hand.length);
  var emojiPairs = {};

  const filter = (reaction, user) => {
    //console.log(reaction);
    return emojis.includes(reaction._emoji.name) && user.id == obj.id;
  };

  //console.log(emojis);

  var cardDifference = amount;
  obj.message.reply(` you must discard ${cardDifference} card(s), otherwise they will be discarded at random.`)

  const embed = new Constants.Discord.MessageEmbed()
  //console.log(obj.result[0].mtg_startingDeck);
  .setTitle(obj.message.author.username + "\'s Hand")
  .setColor(Constants.color_codes[obj.result[0].mtg_user.mtg_startingDeck])
  //.addField("Total Number of Cards", currentHand.hand.length, true)
  //.addField("Total Size of Deck", currentDeck.deck.length, true);
  for (i = 0; i < hand.hand.length; i++)
  {
      var card = null;
      var mana_cost = null;//JSON.parse(card.mana_cost);
      var mana_string = "";
      var power = 0;
      var strength = 0;
      var isCreatureDisplayStatsString = '';

      if (hand.hand[i].startsWith("MTG"))
      {
        card = Constants.cards.filter(search => search.ID == hand.hand[i])[0];

        mana_cost = JSON.parse(card.mana_cost);
        mana_string = Constants.getManaString(mana_cost);

        isCreatureDisplayStatsString = card.type.includes('creature') ? `| ${card.power}/${card.strength}` : ``;
      }
      else
        card = Constants.lands.filter(search => search.ID == hand.hand[i])[0];

      emojiPairs[emojis[i]] = card.ID;


      embed.addField(card.ID.startsWith("LAND") ? "land" : card.type, card.ID.startsWith("LAND") ? `${emojis[i]}(${card.ID.substring(5, card.ID.length)}) ${Constants.returnManaByColorTable(card.colors)}${card.land}` : `${emojis[i]} (${card.ID.substring(4, card.ID.length)}) ${mana_string}${card.card_name} ${isCreatureDisplayStatsString}`, false);
    }

  var message = await obj.message.channel.send({embed});

  for (i = 0; i < hand.hand.length; i++)
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

              var indexOfCardInHand = hand.hand.indexOf(cardID);

              if (indexOfCardInHand != -1)
                hand.hand.splice(indexOfCardInHand, 1);
            }
            Constants.removeIDRequest(obj.id);
        }
        catch (err)
        {
          Constants.removeIDRequest(obj.id);
          console.log(err);
        }
        Constants.removeIDRequest(obj.id);
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

          var indexOfCardInHand = hand.hand.indexOf(cardID);

          if (indexOfCardInHand != -1)
            hand.hand.splice(indexOfCardInHand, 1);
        }

        var randomCardAmountToDiscard = cardDifference - reactions.length;

        for (x = 0; x < randomCardAmountToDiscard; x++)
        {
          var randomCardInHandArray = hand.hand.filter(cardInHand => !removedCards.includes(cardInHand));
          var randomIndex = randomCardInHandArray[Math.floor((Math.random() * randomCardInHandArray.length))];

          var chosenCardIndex = hand.hand.indexOf(randomIndex);
          removedCards.push(hand.hand[chosenCardIndex]);
          hand.hand.splice(chosenCardIndex, 1);
        }
        /*console.log(`After a minute, only ${collected.size} out of 4 reacted.`);
        obj.message.channel.send( "<@" + obj.id + "> you didn\'t select a deck!");
        var indexOfRequest = beginRequests.indexOf(obj.id);
        beginRequests.splice(indexOfRequest, 1);*/

          Constants.removeIDRequest(obj.id);
      });

  Constants.displayRemovedCards(obj, removedCards);
  return {"deck": deck, "hand": hand };
}

async function castInstantOrSorcery(obj, spellType, cardObj, currentBattlefield, currentDeck, currentHand)
{
  var battlefield = await currentBattlefield;
  var deck = await currentDeck;
  var hand = await currentHand;

  var attributes = await cardObj["attributes"];

  var opponentUserData = null;
  var opponentGameData = null;
  var chosen_target = null;
  var mentions = await obj.message.mentions.members.array();
  var userID = "";


  await forEach(attributes.cardType, async (type) => {
  //attributes.cardType.forEach(async function(type){
    //var chosen_target = null;
    //console.log(chosen_target);
    switch (type.toLowerCase()) {
      case 'card_draw':
        var cardDrawAmount = parseInt(attributes[type].add);
        var cardDiscardAmount = parseInt(attributes[type].subtract);
        var newCards = deck.deck.splice(0, cardDrawAmount);
        await newCards.forEach(async function(newCard)
        {
          hand.hand.push(newCard);
          await Constants.displayNewCard(obj, newCard);
        });

        if (cardDiscardAmount < 1)
          break;

        var objects = await discardCards(obj, cardDiscardAmount, deck, hand);
        deck = objects.deck;
        hand = objects.hand;
        break;
      case 'discard_opponent':
        if (mentions.length < 1)
        {
          obj.message.channel.send(`<@${obj.id}> -> in order to use this card you must @ mention the user you wish to target!`);
          //Constants.removeIDRequest(obj.id);
          break;
        }

        var opponentID = mentions[0].id;
        //Constants.pushIDRequest(obj.id);
        //Constants.commandRequests.push(opponentID);

        if (opponentID == obj.id)
        {
          obj.message.channel.send(`<@${obj.id}> -> you can not target yourself!`);
          //Constants.removeIDRequest(obj.id);
          break;
        }

        Constants.pushIDRequest(opponentID);
        //console.log(userID);
        var getOpponentGameDataQuery = `SELECT * FROM mtg_gamedata WHERE mtg_userID='${opponentID}';`;
        var opponentGameData = await HandleConnection.callDBFunction("MYSQL-returnQuery", getOpponentGameDataQuery);

        if (opponentGameData[0] == null || opponentGameData[0] == undefined)
        {
          obj.message.channel.send(`<@${obj.id}> -> no user data found for '${mentions[0].user.username}'!`);
          //Constants.removeIDRequest(obj.id);
          Constants.removeIDRequest(opponentID);
          break;
        }


        var opponent_gameDataObj = opponentGameData[0].mtg_gamedata;
        var opponentBattlefield = JSON.parse(opponent_gameDataObj.mtg_currentBattlefield);
        var opponentHand = JSON.parse(opponent_gameDataObj.mtg_currentHand);
        //var attributes = JSON.parse(card.cardObj.attributes);
        //var opponentID = opponent_gameDataObj.mtg_userID;
        var discardAmount = parseInt(attributes.amount)
        var permanentType = attributes.permanent_type;

        //console.log(cardObj);
        var cardFromLibrary = cardObj.cardID.startsWith("MTG") ? Constants.cards.filter(card => card.ID == cardObj.cardID)[0] : Constants.lands.filter(land => land.ID == cardObj.cardID)[0];
        chosen_target = await chooseTargets(obj, opponentID, opponentBattlefield, discardAmount, permanentType, true, opponentHand, cardFromLibrary, `Choose up to ${discardAmount} '${permanentType}' permanent(s) to discard from player's hand:`);

        //Constants.removeIDRequest(obj.id);
        if (chosen_target == null || chosen_target.length < 1)
        {
          obj.message.channel.send(`<@${obj.id}> -> no targets were selected or no '${permanentType}' permanents were available to be targeted!`);
          break;
        }

        //console.log(chosen_target);

        await forEach(chosen_target, async (id) => {
          opponentHand.hand.splice(opponentHand.hand.indexOf(id), 1);
        });

        updateOpponentGameDataQuery = `UPDATE mtg_gamedata SET mtg_currentHand='${JSON.stringify(opponentHand)}' WHERE mtg_userID='${opponentID}';`;
        await HandleConnection.callDBFunction('MYSQL-fireAndForget', updateOpponentGameDataQuery);
        Constants.removeIDRequest(opponentID);
        break;
      case 'prevent_damage':
        obj.message.channel.send(`<@${obj.id}> -> this card is still being worked on!`);
        break;
      case 'destroy_permanent':
        if (mentions.length < 1)
        {
          obj.message.channel.send(`<@${obj.id}> -> in order to use this card you must @ mention the user you wish to target!`);
          //Constants.removeIDRequest(obj.id);
          break;
        }

        var opponentID = mentions[0].id;
        //Constants.pushIDRequest(obj.id);
        Constants.pushIDRequest(opponentID);

        if (opponentID == obj.id)
        {
          obj.message.channel.send(`<@${obj.id}> -> you can not target yourself!`);
          //Constants.removeIDRequest(obj.id);
          Constants.removeIDRequest(opponentID);
          break;
        }

        //console.log(userID);
        var getOpponentGameDataQuery = `SELECT * FROM mtg_gamedata WHERE mtg_userID='${opponentID}';`;
        var opponentGameData = await HandleConnection.callDBFunction("MYSQL-returnQuery", getOpponentGameDataQuery);

        if (opponentGameData[0] == null || opponentGameData[0] == undefined)
        {
          obj.message.channel.send(`<@${obj.id}> -> no user data found for '${mentions[0].user.username}'!`);
          //Constants.removeIDRequest(obj.id);
          Constants.removeIDRequest(opponentID);
          break;
        }


        var opponent_gameDataObj = opponentGameData[0].mtg_gamedata;
        var opponentBattlefield = JSON.parse(opponent_gameDataObj.mtg_currentBattlefield);
        var opponentHand = JSON.parse(opponent_gameDataObj.mtg_currentHand);
        //var attributes = JSON.parse(card.cardObj.attributes);
        //var opponentID = opponent_gameDataObj.mtg_userID;
        var destroyAmount = parseInt(attributes.amount)
        var permanentType = attributes.permanent_type;

        //console.log(cardObj);
        var cardFromLibrary = cardObj.cardID.startsWith("MTG") ? Constants.cards.filter(card => card.ID == cardObj.cardID)[0] : Constants.lands.filter(land => land.ID == cardObj.cardID)[0];
        chosen_target = await chooseTargets(obj, opponentID, opponentBattlefield, destroyAmount, permanentType, false, null, cardFromLibrary, `Choose up to ${destroyAmount} '${permanentType}' permanent(s) to destroy:`);

        //Constants.removeIDRequest(obj.id);
        //Constants.removeIDRequest(opponentID);
        if (chosen_target == null || chosen_target.length < 1)
        {
          obj.message.channel.send(`<@${obj.id}> -> no targets were selected or no '${permanentType}' permanents were available to be targeted!`);
          Constants.removeIDRequest(opponentID);
          break;
        }

        //console.log(chosen_target);

        await forEach(chosen_target, async (target) => {
          var targetCardFromLibrary = target.cardID.startsWith("MTG") ? Constants.cards.filter(card => card.ID == target.cardID)[0] : Constants.lands.filter(land => land.ID == target.cardID)[0];
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
          { }

          opponentHand.hand.push(target.cardID);
        });

        updateOpponentGameDataQuery = `UPDATE mtg_gamedata SET mtg_currentHand='${JSON.stringify(opponentHand)}', mtg_currentBattlefield='${JSON.stringify(opponentBattlefield)}' WHERE mtg_userID='${opponentID}';`;
        await HandleConnection.callDBFunction('MYSQL-fireAndForget', updateOpponentGameDataQuery);
        Constants.removeIDRequest(opponentID);

        break;
      case 'copy_permanent':
        obj.message.channel.send(`<@${obj.id}> -> this card is still being worked on!`);
        break;
      case 'heal':
        obj.message.channel.send(`<@${obj.id}> -> this card is still being worked on!`);
        break;
      case 'control_permanent':
        obj.message.channel.send(`<@${obj.id}> -> this card is still being worked on!`);
        break;
      case 'buff_creature':
        obj.message.channel.send(`<@${obj.id}> -> this card is still being worked on!`);
        break;
      case 'nerf_creature':
        obj.message.channel.send(`<@${obj.id}> -> this card is still being worked on!`);
        break;
      default:
        break;
    }
  });

  var success = chosen_target != null && chosen_target.length > 0 ? true : false;
  return {"battlefield": battlefield, "deck": deck, "hand": hand, "chosen_target": chosen_target, "success": success};
}

function isNonLandCard(card)
{
  return card.startsWith("MTG");
}
async function chooseTargets(obj, id, battlefield, amount, permanentType, isHand = false, hand = null, cardFromLibrary = null, descriptionText = "")
{
  var selectedCreature = null;
  var emojis = Constants.emoji_letters.slice(0, 26);
  var emojiPairs = {};
  var targets = [];

  const filter = (reaction, user) => {
    //console.log(reaction);
    return emojis.includes(reaction._emoji.name) && user.id == obj.id;
  };

  const member = await obj.message.guild.members.fetch(id);
  const description = cardFromLibrary == null ? '' : cardFromLibrary.description;
  const title = isHand ? `${member.user.username}'s Hand` : member.user.username + "\'s Battlefield";
  const embed = new Constants.Discord.MessageEmbed()
  //console.log(obj.result[0].mtg_startingDeck);
  .setTitle(title)
  .setDescription(`Card Attributes: ${description}\n\n${descriptionText}`)
  .setColor(Constants.color_codes.black)

  if (permanentType.toLowerCase() == 'untapped_creature' || permanentType.toLowerCase() == 'tapped_creature' || permanentType.toLowerCase() == 'equipped_creature' || permanentType.toLowerCase() == 'creature' || permanentType.toLowerCase() == 'non_land')
  {
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
      await forEach(battlefield["creatures"], async (creature) =>
      {
          //console.log(emojis[i]);

          if ((permanentType.toLowerCase() == 'untapped_creature' && creature.isTapped) || (permanentType.toLowerCase() == 'tapped_creature' && !creature.isTapped) || (permanentType.toLowerCase() == 'equipped_creature' && creature.equipped_cards.length < 1))
          {  }
          else {

            var cardFromLibrary = Constants.cards.filter(search => search.ID == creature.cardID)[0];

            var isAttacking = creature.isDeclaredAttacker ? Constants.emoji_id.sword : '';
            var isDefending = creature.isDeclaredDefender ? Constants.emoji_id.shield : '';
            var legendaryStatus = cardFromLibrary.legendary ? "- Legendary" : "";
            var isTapped = creature.isTapped ? `<:tapped:${Constants.emoji_id.tapped}> *(tapped)*` : ``;
            var creatureStats = `${cardFromLibrary.power + Constants.getEquippedEnchantments("power", creature, battlefield["enchantments"])}/${cardFromLibrary.strength + Constants.getEquippedEnchantments("strength", creature, battlefield["enchantments"])}`;
            var isCreatureDisplayStatsString = cardFromLibrary.type == 'creature' ? `${creatureStats} ${isAttacking}${isDefending}` : ``;

            emojiPairs[emojis[emoji_index]] = creature;
            embed.addField(`${cardFromLibrary.type.capitalize()} ${legendaryStatus}`, `${emojis[emoji_index]} ${isTapped} ${cardFromLibrary.card_name} ${isCreatureDisplayStatsString}`, false);
            emoji_index++;
          }
      });
    }
    else {
      await forEach(hand.hand, async (cardInHand) =>
      {
          //console.log(emojis[i]);

          if ((permanentType.toLowerCase() == 'creature' && !creature.isTapped) || (permanentType.toLowerCase() == 'non_land' && !isNonLandCard(cardInHand)))
          {  }
          else {

            var cardFromLibrary = Constants.cards.filter(search => search.ID == cardInHand)[0];

            //var isAttacking = creature.isDeclaredAttacker ? Constants.emoji_id.sword : '';
            //var isDefending = creature.isDeclaredDefender ? Constants.emoji_id.shield : '';
            var legendaryStatus = cardFromLibrary.legendary ? "- Legendary" : "";
            //var isTapped = card.isTapped ? `<:tapped:${Constants.emoji_id.tapped}> *(tapped)*` : ``;
            //var creatureStats = `${cardFromLibrary.power + Constants.getEquippedEnchantments("power", creature, battlefield["enchantments"])}/${cardFromLibrary.strength + Constants.getEquippedEnchantments("strength", creature, battlefield["enchantments"])}`;
            var isCreatureDisplayStatsString = cardFromLibrary.type == 'creature' ? `| ${cardFromLibrary.power}/${cardFromLibrary.strength}` : ``;

            emojiPairs[emojis[emoji_index]] = cardInHand;
            embed.addField(`${cardFromLibrary.type.capitalize()} ${legendaryStatus}`, `${emojis[emoji_index]} ${cardFromLibrary.card_name} ${isCreatureDisplayStatsString}`, false);
            emoji_index++;
          }
      });
    }
  }

  var keys = Object.keys(emojiPairs);

  if (keys.length <= 0)
    return [];

  var message = await obj.message.channel.send({embed});


  for (i = 0; i < keys.length; i++)
  {
    //var emoji = Constants.client.emojis.get("name", emojis[i]);
    message.react(emojis[i]);
  }

  await message.awaitReactions(filter, { max: amount, time: Constants.reactionTimes.chooseTarget, errors: ['time'] })
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

  return targets;
}

function isSpecialCard(card)
{
  return card.cardObj.type == ("basic land") || card.cardObj.type.includes("enchantment") || card.cardObj.type.includes("instant") || card.cardObj.type.includes("sorcery");
}

function returnClosestMatchToCard(hand, stringToMatchArrayList)
{
    var stringToMatchArray = stringToMatchArrayList.join(" ").split('');

    var card = null;
    var card_index = -1;
    var handMatch = {};

    if (stringToMatchArrayList[0] != undefined)
    {
      var firstMatch = stringToMatchArrayList[0];

      //console.log("firstMatch: " + firstMatch);

      var searchForLandCardByIDResult = Constants.lands.filter(land => land.ID == String(firstMatch).toUpperCase())[0];

      if (!(searchForLandCardByIDResult == undefined && searchForLandCardByIDResult == null))
      {
        //console.log(searchForLandCardByIDResult);
        //var resultIndexFirstMatch = hand.hand.indexOf(searchForLandCardByIDResult);
        if (hand.hand.indexOf(searchForLandCardByIDResult.ID) > -1) {
          var landCardData = {
            cardID: searchForLandCardByIDResult.ID,
            //cardName: searchForLandCardByIDResult.ID.toUpperCase().startsWith("LAND") ? searchForLandCardByIDResult.land : searchForLandCardByIDResult.card_name,
            handIndex: hand.hand.indexOf(searchForLandCardByIDResult.ID),
            cardObj: searchForLandCardByIDResult//cardID.startsWith("MTG") ? Constants.cards.filter(search => search.ID == cardID)[0] : Constants.lands.filter(search => search.ID == cardID)[0]
          }

          return landCardData;
        }
      }

      var searchForCardByIDResult = Constants.cards.filter(card => card.ID == String(firstMatch).toUpperCase())[0];

      if (!(searchForCardByIDResult == undefined && searchForCardByIDResult == null))
      {
        //console.log(searchForCardByIDResult);
        //var resultIndexFirstMatch = local.cards.indexOf(searchForCardByIDResult);

        if (hand.hand.indexOf(searchForCardByIDResult.ID) > -1) {
          var cardData = {
            cardID: searchForCardByIDResult.ID,
            //cardName: searchForCardByIDResult.ID.toUpperCase().startsWith("LAND") ? searchForCardByIDResult.land : searchForCardByIDResult.card_name,
            handIndex: hand.hand.indexOf(searchForCardByIDResult.ID),
            cardObj: searchForCardByIDResult//cardID.startsWith("MTG") ? Constants.cards.filter(search => search.ID == cardID)[0] : Constants.lands.filter(search => search.ID == cardID)[0]
          }

          return cardData;
        }
      }
    }

    for (i = 0; i < hand.hand.length; i++)
    {
      card = hand.hand[i].startsWith("LAND") ? Constants.lands.filter(search => search.ID == hand.hand[i])[0] : Constants.cards.filter(search => search.ID == hand.hand[i])[0];

      var cardNameArray = card.ID.startsWith("MTG") ? card.card_name.toLowerCase().split('') : card.land.toLowerCase().split('');
      var cardIDArray = hand.hand[i].toLowerCase().split('');

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
          //if ((stringToMatchArray[indexOfChar] + stringToMatchArray[indexOfChar + 1]) == (cardNameArray[indexOfChar] + cardNameArray[indexOfChar + 1]))
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
      handMatch[card.ID] = id_match + name_match + consecutive_letters;
    }

    //card = null;

    var keys = Object.keys(handMatch);
    var values = Object.values(handMatch);
    card_index = values.indexOf(Math.max.apply(Math, values));
    var handIndex = hand.hand.indexOf(keys[card_index]);
    var cardID = hand.hand[handIndex];

    if (cardID == undefined)
       return null;

    if (cardID == null)
       return null;

    var cardData = {
      cardID: cardID,
      handIndex: handIndex,
      cardObj: cardID.startsWith("MTG") ? Constants.cards.filter(search => search.ID == cardID)[0] : Constants.lands.filter(search => search.ID == cardID)[0]
    }

    return cardData;
}

function returnNewID()
{
  var chars = ["abcdefghijklmnopqrstuvwxyz","ABCDEFGHIJKLMNOPQRSTUVWXYZ","0123456789"];
  var id = "";

  for (i = 0; i < Constants.fieldIDLength; i++)
  {
    var charArrayIndex = Math.floor((Math.random() * chars.length));
    var charFromArray = Math.floor((Math.random() * chars[charArrayIndex].length));

    id += chars[charArrayIndex][charFromArray];
  }

  return id;
}

function enoughManaAvailable(battlefield, card)
{
  if (card.cardObj.type.includes("land"))
    return true;

  var mana_cost = JSON.parse(card.cardObj.mana_cost);
  var mana_pool = {
    white: 0,
    black: 0,
    green: 0,
    red: 0,
    blue: 0
  };

  var basic_mana_to_produce = {
    plains: 1,
    swamp: 1,
    forest: 1,
    mountain: 1,
    island: 1
  };

  /*for (i = 0; i < battlefield["lands"].length; i++)
  {
    var LandOnField = battlefield["lands"][i];
    var land = Constants.lands.filter(search => search.ID == LandOnField.cardID)[0];

    if (!LandOnField.isTapped)
      mana_pool[land.colors] += LandOnField.manaProduceAmount; //basic_mana_to_produce[land.land.toLowerCase()];
  }*/

  for (i = 0; i < battlefield["lands"].length; i++)
  {
    var LandOnField = battlefield["lands"][i];
    var land = Constants.lands.filter(search => search.ID == LandOnField.cardID)[0];

    if (land == undefined)
       continue;

    if (land == null)
       continue;

    var landColors = JSON.parse(land.colors);

    if (!LandOnField.isTapped)
    {
      var keys = Object.keys(landColors.colors);
      keys.forEach((color) => {
        mana_pool[color] += landColors.colors[color]; //basic_mana_to_produce[land.land.toLowerCase()];
      });
    }
  }

  if (mana_cost["white"] <= mana_pool["white"] && mana_cost["black"] <= mana_pool["black"] && mana_cost["green"] <= mana_pool["green"] && mana_cost["red"] <= mana_pool["red"] && mana_cost["blue"] <= mana_pool["blue"])
    return true;
  else
    return false;
}

function manaIncludes(colorTable, allManaTypes)
{
  //var colorTable = 
  let checker = (arr, target) => target.every(v => arr.includes(v));

  /*if (colorTable.includes("white")) {
    console.log(`colorTable: ${colorTable}`);

    console.log(`allManaTypes: ${allManaTypes}`); //mana cost
  }*/

  //var check = checker(colorTable, allManaTypes);

  //console.log(`colorTable in allManaTypes: ${check}`);
  /*var 

  jsonData.colors.forEach((color, manaProduceAmount) => {
    if (color == manaType)
  });

  return false;*/



  return checker(colorTable, allManaTypes);
}

function tapMana(currentBattlefield, mana_to_tap)
{
  var newBattlefield = currentBattlefield;
  var lands = newBattlefield["lands"];

  var untappedLands = lands.filter(land => land.isTapped == false);

  var mana_keys = Object.keys(mana_to_tap);
  var mana_values = Object.values(mana_to_tap);

  var updatedLands = [];

  //console.log(mana_keys);

  var mana_to_tap_array = []; //mana cost

  mana_keys.forEach(function(mana) {
    var value = mana_values[mana_keys.indexOf(mana)];

    if (value > 0)
      mana_to_tap_array.push(mana);
  });

  //console.log(mana_to_tap_array);

  mana_keys.forEach(function(mana) {
    var value = mana_values[mana_keys.indexOf(mana)];
    //var landFromDB = Constants.lands.filter(land => land.ID == )
    //console.log(`value: ${value}`);
    //console.log("objects: " + Object.keys(mana_to_tap).some((key) => mana_to_tap[key] > 0));

    var untappedLandsOfSameColor = untappedLands.filter(colorLand => manaIncludes(colorLand.colors, mana_to_tap_array));

    //if (mana == "white")
      //console.log(untappedLandsOfSameColor);

    for (i = 0; i < value; i++)
    {
      if (untappedLandsOfSameColor[i] != undefined) {
        untappedLandsOfSameColor[i].isTapped = true;
        updatedLands.push(untappedLandsOfSameColor[i]);
      }
    }
  });

  for (i = 0; i < updatedLands.length; i++)
  {
    var updatedLand = updatedLands[i];
    var landToReplace = lands.indexOf(lands.filter(search => search.fieldID == updatedLand.fieldID)[0]);
    lands[landToReplace] = updatedLand;
  }

  return newBattlefield;
}

var local = {
  playcard:async function(cmd, args)
  {
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
        obj.message.reply(" you were killed recently. You must first get a new deck with \`m!begin\` before trying to play!");
        return;
      }

      if (Constants.commandRequests.includes(obj.id))
        return Constants.MessageCodes.USER_TASK_EXISTS;

      Constants.pushIDRequest(obj.id);

      if (obj.args.length < 2)
      {
        obj.message.reply(" no card specified!");
        //Constants.removeIDRequest(obj.id);
        return;
      }

      var gameData = await HandleConnection.callDBFunction("MYSQL-returnQuery", "SELECT * FROM mtg_gamedata WHERE mtg_userID=\'" + obj.id + "\'");
      var gameDataObj = gameData[0].mtg_gamedata;
      var userDataObj = obj.result[0].mtg_user;
      var currentHand = JSON.parse(gameDataObj.mtg_currentHand);
      var currentDeck = JSON.parse(gameDataObj.mtg_currentDeck);
      var guildID = obj.message.guild.id;
      var guilds = JSON.parse(userDataObj.mtg_guilds);
      var guildObjID = `${Constants.guildPrefix}${guildID}`;

      if (guilds[guildObjID] == undefined || guilds[guildObjID].optedInToServer == 0) {
        obj.message.reply(" you must first opt in before you can play cards!");
        //Constants.removeIDRequest(obj.id);
        return;
      }

      if (userDataObj.mtg_currentPhase != 2)
      {
        var currentBattlefield = JSON.parse(gameDataObj.mtg_currentBattlefield);
        var card = returnClosestMatchToCard(currentHand, obj.args.slice(1, obj.args.length));
        var mtg_allowedLandCast = gameDataObj.mtg_allowedLandCast;

        if (card == null || card == undefined)
        {
          console.log("no card found");
          obj.message.reply(" could not find the requested card!");
          return;
        }

        if (mtg_allowedLandCast <= 0 && card.cardObj.type.includes("land"))
        {
          obj.message.reply(" you have already played the maximum allowed number of lands this phase!");
          //Constants.removeIDRequest(obj.id);
          return;
        }

        var cardObj = {
          fieldID: returnNewID(),
          isTapped: String(card.cardObj.attributes).includes("haste") || isSpecialCard(card) ? false : true,
          cardID: card.cardID,
          ownerID: obj.id,
          //cardName: card.cardID.startsWith("LAND") ? card.cardObj.land : card.cardObj.card_name,
          equipped_cards: []
        };

        if (!enoughManaAvailable(currentBattlefield, card))
        {
          obj.message.reply(` you can't cast ${card.cardObj.card_name} because you don't have enough mana!`);
          //Constants.removeIDRequest(obj.id);
          return;
        }

        var mana_to_tap = {
          white: 0,
          black: 0,
          green: 0,
          red: 0,
          blue: 0
        }

        var chosen_target = null;

        if (card.cardObj.type.includes("creature"))
        {
          if (currentBattlefield["creatures"].length >= Constants.maximumBattlefieldSize.creature)
          {
            obj.message.reply(` you have already played the maximum amount of creatures allowed on the field!`);
            //Constants.removeIDRequest(obj.id);
            return;
          }
          cardObj["power"] = card.cardObj.power;
          cardObj["strength"] = card.cardObj.strength;
          cardObj["isDeclaredDefender"] = false;
          cardObj["isDeclaredAttacker"] = false;
          cardObj["permanent"] = true;
          cardObj["attributes"] = card.cardObj.attributes == null ? "" : card.cardObj.attributes,
          //cardObj["equipped_cards"]= [];
          currentBattlefield["creatures"].push(cardObj);
          var mana_cost = JSON.parse(card.cardObj.mana_cost);
          mana_to_tap["white"] = mana_cost["white"];
          mana_to_tap["black"] = mana_cost["black"];
          mana_to_tap["green"] = mana_cost["green"];
          mana_to_tap["red"] = mana_cost["red"];
          mana_to_tap["blue"] = mana_cost["blue"];
        }
        else if (card.cardObj.type.includes("land")) {
          cardObj["manaProduceAmount"] = 1;

          
          var values = Object.values(card.cardObj.colors);

          var JSONData = JSON.parse(card.cardObj.colors);
          var keys = Object.keys(JSONData.colors);

          //console.log(JSONData);

          //console.log(keys);
          //console.log(values);
          //console.log(card.cardObj.colors);
          cardObj["colors"] = keys;//card.cardObj.colors;
          cardObj["permanent"] = true;
          //cardObj["equipped_cards"]= [];
          currentBattlefield["lands"].push(cardObj);
        }
        else if (card.cardObj.type.includes("instant")) {
          cardObj["target"] = null;
          cardObj["attributes"] = JSON.parse(card.cardObj.attributes);
          cardObj["permanent"] = false;
          var mana_cost = JSON.parse(card.cardObj.mana_cost);
          mana_to_tap["white"] = mana_cost["white"];
          mana_to_tap["black"] = mana_cost["black"];
          mana_to_tap["green"] = mana_cost["green"];
          mana_to_tap["red"] = mana_cost["red"];
          mana_to_tap["blue"] = mana_cost["blue"];
          var objects = await castInstantOrSorcery(obj, "instant", cardObj, currentBattlefield, currentDeck, currentHand);

          //console.log(objects);

          if (!objects.success)
          {
            //obj.message.reply(`you didn't select any cards, or no cards were available to be selected from this user!`);
            //Constants.removeIDRequest(obj.id);
            return;
          }

          currentBattlefield = objects.battlefield;
          currentDeck = objects.deck;
          currentHand = objects.hand;
          chosen_target = objects.chosen_target;
        }
        else if (card.cardObj.type.includes("sorcery")) {
          cardObj["target"] = null;
          cardObj["attributes"] = JSON.parse(card.cardObj.attributes);
          cardObj["permanent"] = false;
          var mana_cost = JSON.parse(card.cardObj.mana_cost);
          mana_to_tap["white"] = mana_cost["white"];
          mana_to_tap["black"] = mana_cost["black"];
          mana_to_tap["green"] = mana_cost["green"];
          mana_to_tap["red"] = mana_cost["red"];
          mana_to_tap["blue"] = mana_cost["blue"];
          var objects = await castInstantOrSorcery(obj, "instant", cardObj, currentBattlefield, currentDeck, currentHand);

          if (!objects.success)
          {
            //obj.message.reply(`you didn't select any cards, or no cards were available to be selected from this user!`);
            //Constants.removeIDRequest(obj.id);
            return;
          }
          currentBattlefield = objects.battlefield;
          currentDeck = objects.deck;
          currentHand = objects.hand;
          chosen_target = objects.chosen_target;
        }
        else if (card.cardObj.type.includes("enchantment")) {
          if (currentBattlefield["enchantments"].length >= Constants.maximumBattlefieldSize.enchantment)
          {
            obj.message.reply(` you have already played the maximum amount of enchantments allowed on the field!`);
            //Constants.removeIDRequest(obj.id);
            return;
          }
          cardObj["target"] = null;
          cardObj["attributes"] = JSON.parse(card.cardObj.attributes);
          cardObj["permanent"] = true;
          var mana_cost = JSON.parse(card.cardObj.mana_cost);
          mana_to_tap["white"] = mana_cost["white"];
          mana_to_tap["black"] = mana_cost["black"];
          mana_to_tap["green"] = mana_cost["green"];
          mana_to_tap["red"] = mana_cost["red"];
          mana_to_tap["blue"] = mana_cost["blue"];

          if (card.cardObj.type.includes("aura"))
          {
            var mentions = await obj.message.mentions.members.array();

            //console.log(mentions);
            //console.log(cardObj["attributes"]);
            //console.log(cardObj["attributes"]["cardType"]);
            if (cardObj["attributes"]["cardType"].toLowerCase() == 'aura')
            {
              //Constants.pushIDRequest(obj.id);
              var attributes = JSON.parse(card.cardObj.attributes);
              var targetAmount = parseInt(attributes["amount"]);
              var permanentType = String(attributes["permanent_type"]);
              chosen_target = await chooseTargets(obj, obj.id, currentBattlefield, targetAmount, permanentType, false, null, card.cardObj, "Choose a permanent to equip:");

              if (chosen_target == null || chosen_target.length < 1)
              {
                obj.message.channel.send(`<@${obj.id}> -> no creatures were targeted or you don't have any creatures available to target!`);
                //Constants.removeIDRequest(obj.id);
                return;
              }

              for(i = 0; i < chosen_target.length; i++)
              {
                if (permanentType.includes('creature'))
                {
                  var indexOfCreature = currentBattlefield["creatures"].indexOf(chosen_target[i]);
                  currentBattlefield["creatures"][indexOfCreature].equipped_cards.push(cardObj.fieldID);
                  currentBattlefield["enchantments"].push(cardObj);
                }
                else if (permanentType.includes('lands'))
                {
                  var indexOfLand = currentBattlefield["lands"].indexOf(chosen_target[i]);
                  currentBattlefield["lands"][indexOfLand].equipped_cards.push(cardObj.fieldID);
                  currentBattlefield["enchantments"].push(cardObj);
                }
              }
            }
            else if (cardObj["attributes"]["cardType"].toLowerCase() == 'aura_opponent')
            {
              if (mentions.length < 1)
              {
                obj.message.channel.send(`<@${obj.id}> -> in order to use this card you must @ mention the user you wish to target!`);
                //Constants.removeIDRequest(obj.id);
                return;
              }

              //Constants.pushIDRequest(obj.id);
              var userID = mentions[0].id;

              if (userID == obj.id)
              {
                obj.message.channel.send(`<@${obj.id}> -> you can not target yourself!`);
                //Constants.removeIDRequest(obj.id);
                return;
              }

              //console.log(userID);
              var getOpponentGameDataQuery = `SELECT * FROM mtg_gamedata WHERE mtg_userID='${userID}';`;
              var opponentGameData = await HandleConnection.callDBFunction("MYSQL-returnQuery", getOpponentGameDataQuery);

              if (opponentGameData[0] == null || opponentGameData[0] == undefined)
              {
                obj.message.channel.send(`<@${obj.id}> -> no user data found for '${mentions[0].user.username}'!`);
                return;
              }


              var opponent_gameDataObj = opponentGameData[0].mtg_gamedata;
              var opponentBattlefield = await JSON.parse(opponent_gameDataObj.mtg_currentBattlefield);
              var opponentHand = await JSON.parse(opponent_gameDataObj.mtg_currentHand);
              var attributes = await JSON.parse(card.cardObj.attributes);
              var targetAmount = parseInt(attributes["amount"]);
              var permanentType = String(attributes["permanent_type"]);
              chosen_target = await chooseTargets(obj, userID, opponentBattlefield, targetAmount, permanentType, false, null, card.cardObj, "Choose a permanent to equip:");

              if (chosen_target == null || chosen_target.length < 1)
              {
                var messageType = chosen_target == null ? `<@${obj.id}> -> this user doesn't have any permanents that you can equip!` : `<@${obj.id}> -> no permanents were equipped!`;
                obj.message.channel.send(`${messageType}`);
                //Constants.removeIDRequest(obj.id);
                return;
              }

              for(i = 0; i < chosen_target.length; i++)
              {
                if (permanentType.includes('creature'))
                {
                  var indexOfCreature = opponentBattlefield["creatures"].indexOf(chosen_target[i]);
                  opponentBattlefield["creatures"][indexOfCreature].equipped_cards.push(cardObj.fieldID);
                  opponentBattlefield["enchantments"].push(cardObj);
                }
                else if (permanentType.includes('lands'))
                {
                  var indexOfLand = opponentBattlefield["lands"].indexOf(chosen_target[i]);
                  opponentBattlefield["lands"][indexOfLand].equipped_cards.push(cardObj.fieldID);
                  opponentBattlefield["enchantments"].push(cardObj);
                }
              }

              var updateOpponentGameDataQuery = `UPDATE mtg_gamedata SET mtg_currentHand='${JSON.stringify(opponentHand)}', mtg_currentBattlefield='${JSON.stringify(opponentBattlefield)}' WHERE mtg_userID='${userID}';`;
              await HandleConnection.callDBFunction("MYSQL-returnQuery", updateOpponentGameDataQuery);
            }
            else {
              console.log('unknown enchantment type');
            }

            //Constants.removeIDRequest(obj.id);
          }
          else {
            currentBattlefield["enchantments"].push(cardObj);
          }
        }
        else {
          obj.message.reply(` please contact an administrator. ${card.cardID} is not a valid card type.`);
          //Constants.removeIDRequest(obj.id);
          return;
        }

        currentHand.hand.splice(currentHand.hand.indexOf(card.cardID), 1);
        var landCast = card.cardObj.type.includes("land") ? mtg_allowedLandCast - 1 : mtg_allowedLandCast;

        if (!(card.cardObj.type.includes("land")))
          currentBattlefield = tapMana(currentBattlefield, mana_to_tap);


        var updateQuery = `UPDATE mtg_gamedata SET mtg_currentDeck='${JSON.stringify(currentDeck)}', mtg_currentHand='${JSON.stringify(currentHand)}', mtg_currentBattlefield='${JSON.stringify(currentBattlefield)}', mtg_allowedLandCast='${landCast}' WHERE mtg_userID='${obj.id}';`;
        await HandleConnection.callDBFunction("MYSQL-returnQuery", updateQuery);

        var cardName = card.cardID.startsWith("MTG") ? card.cardObj.card_name : card.cardObj.land;
        var chosen_cards = ``;
        if (chosen_target != null)
        {
          for (i = 0; i < chosen_target.length; i++)
          {
            if (typeof(chosen_target[i]) == typeof("STRING"))
            {
              var cardFromLibrary = chosen_target[i].startsWith("MTG") ? Constants.cards.filter(card => card.ID == chosen_target[i])[0] : Constants.lands.filter(land => land.ID == chosen_target[i])[0];
              if (i >= chosen_target.length)
                chosen_cards += cardFromLibrary.card_name + "|";
              else
                chosen_cards += cardFromLibrary.card_name;
            }
            else {
              var cardFromLibrary = chosen_target[i].cardID.startsWith("MTG") ? Constants.cards.filter(card => card.ID == chosen_target[i].cardID)[0] : Constants.lands.filter(land => land.ID == chosen_target[i].cardID)[0];
              if (i >= chosen_target.length)
                chosen_cards += cardFromLibrary.card_name + "|";
              else
                chosen_cards += cardFromLibrary.card_name;
            }
          }
        }
        var chosen_target_string = chosen_target == null || chosen_target.length < 1 ? `` : ` on **${chosen_cards}**`;
        obj.message.reply(`you chose to cast **${cardName}**${chosen_target_string}!`);
        //Constants.removeIDRequest(obj.id);
      }
      else {
        obj.message.reply(" you can only play cards during your first and third phase! Please try using \`m!nextphase\` instead.");
        //Constants.removeIDRequest(obj.id);
      }
  }
};

module.exports = local;
HandleFunctionCall.RegisterFunction(["p", "pc", "play", "playcard"], local.playcard);
