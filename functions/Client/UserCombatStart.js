const Constants = require('../util/Constants');
const HandleConnection = require('../handle/HandleConnection');
const HandleFunctionCall = require('../HandleFunctionCall');
const NextPhase = require('./UserNextPhase');

function getMatchUpString(obj, opponent, matchUps, p1Battlefield, p2Battlefield)
{
  var string = ``;
  for (i = 0; i < matchUps.length; i++)
  {
    var keys = Object.keys(matchUps[i]);
    var values = Object.values(matchUps[i]);

    var p1Creature = values[0];
    var p2Creature = values[1];

    var p1Power = parseInt(p1Creature.power) + Constants.getEquippedEnchantments("power", p1Creature, p1Battlefield["enchantments"]);
    var p1Strength = parseInt(p1Creature.strength) + Constants.getEquippedEnchantments("strength", p1Creature, p1Battlefield["enchantments"]);

    var p1CreatureFromLibrary = Constants.cards.filter(search => search.ID == p1Creature.cardID)[0];

    if (p2Creature == "none")
    {
      string += `YOUR ${p1CreatureFromLibrary.card_name} ${p1Power}/${p1Strength} [DEALT ${p1Power} DMG] ${Constants.emoji_id.sword} <@${opponent}>\n`;
    }
    else {
      var p2CreatureFromLibrary = Constants.cards.filter(search => search.ID == p2Creature.cardID)[0];

      var p2Power = parseInt(p2Creature.power) + Constants.getEquippedEnchantments("power", p2Creature, p2Battlefield["enchantments"]);
      var p2Strength = parseInt(p2Creature.strength) + Constants.getEquippedEnchantments("strength", p2Creature, p2Battlefield["enchantments"]);
      //var p2Outcome = p1Strength <= 0

      p1Strength -= p2Power;
      p2Strength -= p1Power;

      var p1Outcome = p2Strength <= 0 && !p2Creature.attributes.includes("indestructible") ? "[KILLED]" : "[WEAKENED]";
      var p1DidAttackerDie = p1Strength <= 0 && !p1Creature.attributes.includes("indestructible") ? ", but also died after the attack!" : ", and survived!";

      string += `YOUR ${p1CreatureFromLibrary.card_name} ${p1Power}/${p1Strength} ${p1Outcome} ${Constants.emoji_id.sword} THEIR ${p2CreatureFromLibrary.card_name} ${p2Power}/${p2Strength}${p1DidAttackerDie}\n`;
    }
  }
  return string;
}

var local = {
  attack:async function(cmd, args)
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

  afterCheckUser: async function(obj)
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

      var gameData = await HandleConnection.callDBFunction("MYSQL-returnQuery", "SELECT * FROM mtg_gamedata WHERE mtg_userID=\'" + obj.id + "\'");
      var gameDataObj = gameData[0].mtg_gamedata;
      var userDataObj = obj.result[0].mtg_user;
      var currentBattlefield = JSON.parse(gameDataObj.mtg_currentBattlefield);
      var currentDeck = JSON.parse(gameDataObj.mtg_currentDeck);
      var currentHand = JSON.parse(gameDataObj.mtg_currentHand);
      var guildID = obj.message.guild.id;

      if (gameDataObj.mtg_currentPhase != 2) {
        obj.message.reply(" you can only attack during your combat phase! (phase 2)");
        //Constants.removeIDRequest(obj.id);
        return;
      }

      var guilds = JSON.parse(userDataObj.mtg_guilds);
      var guildObjID = `${Constants.guildPrefix}${guildID}`;
      if (guilds[guildObjID] == undefined || guilds[guildObjID].optedInToServer == 0) {
        obj.message.reply(" you must first opt in before you can attack!");
        //Constants.removeIDRequest(obj.id);
        return;
      }

      if (currentBattlefield["creatures"].length < 1 || currentBattlefield["creatures"].filter(creature => creature.isDeclaredAttacker).length < 1) {
        obj.message.reply(" you don't have any creatures to attack with!");
        //Constants.removeIDRequest(obj.id);
        return;
      }

      var now = Date.now();
      if (userDataObj.mtg_lastAttackDateTime != null && userDataObj.mtg_lastAttackDateTime != undefined)
      {
        var mtg_lastAttackDateTime = new Date(userDataObj.mtg_lastAttackDateTime);
        var timeToAllowAttack = Date.parse(new Date(Constants.moment(mtg_lastAttackDateTime).add(Constants.attackCooldown, 'minutes').format(Constants.momentTimeFormat)));
        var attackTimeDifference = Constants.getTimeBetween(timeToAllowAttack, now);
        var timeString = `${parseInt(attackTimeDifference.hours.toFixed()).pad()}:${parseInt(attackTimeDifference.minutes.toFixed()).pad()}:${parseInt(attackTimeDifference.seconds.toFixed()).pad()}`;
        //AttackCooldown = timeToAllowAttack <= now ? "READY" : timeString;

        if (timeToAllowAttack > now)
        {
          obj.message.reply(`you still have \`${timeString}\` until you can attack!`);
          //Constants.removeIDRequest(obj.id);
          return;
        }
      }

      var message = await obj.message.channel.send(`<@${obj.id}> -> finding a target...`);

      /*var findTargetQuery = `SELECT mtg_userId
                              FROM mtg_user AS r1 JOIN
                                   (SELECT CEIL(RAND() *
                                                 (SELECT MAX(id)
                                                    FROM mtg_user WHERE mtg_userID <> '${obj.id}' AND mtg_optedIn='1')) AS id)
                                    AS r2
                             WHERE r1.id >= r2.id
                             ORDER BY r1.id ASC
                             LIMIT 1`;*/

                             //order by rand() LIMIT 1 | mtg_userID <> '${obj.id}' AND
      var commandRequestsString = `'${obj.id}'`;
      if (Constants.commandRequests.length > 0)
        commandRequestsString += `,`;

      Constants.commandRequests.forEach(function(id)
      {
        if (Constants.commandRequests.indexOf(id) == Constants.commandRequests.length - 1)
          commandRequestsString += `'${id}'`;
        else
          commandRequestsString += `'${id}',`
      });

      var findTargetQuery = `SELECT * from mtg_user WHERE mtg_userID NOT IN (${commandRequestsString}) AND mtg_userID <> '${obj.id}' AND JSON_EXTRACT(mtg_guilds, '$.${Constants.guildPrefix}${guildID}.optedInToServer') > 0 AND mtg_health > 0 order by rand() LIMIT 1;`;
      //console.log(findTargetQuery);
      var targetID = await HandleConnection.callDBFunction("MYSQL-returnQuery", findTargetQuery);

      //console.log(targetID);

      if (targetID == undefined || targetID[0] == null)
      {
        obj.message.reply(" there is currently no one available to be attacked!");
        //Constants.removeIDRequest(obj.id);
        return;
      }

      var opponentID = targetID[0].mtg_user.mtg_userID;
      Constants.pushIDRequest(opponentID);

      //console.log(targetID);

      var getOpponentDataQuery = `SELECT * FROM mtg_user WHERE mtg_userID='${targetID[0].mtg_user.mtg_userID}';`;
      var getOpponentGameDataQuery = `SELECT * FROM mtg_gamedata WHERE mtg_userID='${targetID[0].mtg_user.mtg_userID}';`;
      var opponentUserData = await HandleConnection.callDBFunction("MYSQL-returnQuery", getOpponentDataQuery);
      var opponentGameData = await HandleConnection.callDBFunction("MYSQL-returnQuery", getOpponentGameDataQuery);

      if (opponentUserData.length < 1 || opponentGameData.length < 1)
      {
        Constants.removeIDRequest(opponentID);
        return;
      }

      //Constants.pushIDRequest()

        //console.log(opponent);

      var opponent_userDataObj = opponentUserData[0].mtg_user;
      var opponent_gameDataObj = opponentGameData[0].mtg_gamedata;

      //console.log(opponentGameData);

      var opponentBattlefield = JSON.parse(opponent_gameDataObj.mtg_currentBattlefield);
      var opponentDeck = JSON.parse(opponent_gameDataObj.mtg_currentDeck);
      var opponentHand = JSON.parse(opponent_gameDataObj.mtg_currentHand);

      var attackerCreatures = currentBattlefield["creatures"];
      var defenderCreatures = opponentBattlefield["creatures"];

      var declaredAttackers = [];
      var declaredDefenders = [];
      var matchUps = [];

      for (i = 0; i < attackerCreatures.length; i++)
      {
          if (attackerCreatures[i].isDeclaredAttacker && !attackerCreatures[i].isTapped)
            declaredAttackers.push(attackerCreatures[i]);
      }

      for (i = 0; i < defenderCreatures.length; i++)
      {
        if (defenderCreatures[i].isDeclaredDefender && !defenderCreatures[i].isTapped)
          declaredDefenders.push(defenderCreatures[i]);
      }

      declaredAttackers = Constants.shuffle(declaredAttackers);
      declaredDefenders = Constants.shuffle(declaredDefenders);

      for (i = 0; i < declaredAttackers.length; i++)
      {
        if (declaredDefenders[i] != null) {
          var newMatchUp = {
          }

          newMatchUp[declaredAttackers[i].fieldID] = declaredAttackers[i];
          newMatchUp[declaredDefenders[i].fieldID] = declaredDefenders[i];
          matchUps.push(newMatchUp);
        }
        else {
          var newMatchUp = {
          }

          newMatchUp[declaredAttackers[i].fieldID] = declaredAttackers[i];
          newMatchUp["none"] = "none";
          matchUps.push(newMatchUp);
        }
      }

      message.edit(`<@${obj.id}> ${Constants.emoji_id.sword} <@${opponent_userDataObj.mtg_userID}> \n\n${getMatchUpString(obj, opponent_userDataObj.mtg_userID, matchUps, currentBattlefield, opponentBattlefield)}`);

      var opponent_health = parseInt(opponent_userDataObj.mtg_health);

      var attackerCreaturesThatDied = [];
      var opponentCreaturesThatDied = [];

      for (i = 0; i < matchUps.length; i++)
      {
        var keys = Object.keys(matchUps[i]);
        var values = Object.values(matchUps[i]);

        var p1Creature = values[0];
        var p2Creature = values[1];

        var p1Power = parseInt(p1Creature.power) + Constants.getEquippedEnchantments("power", p1Creature, currentBattlefield["enchantments"]);
        var p1Strength = parseInt(p1Creature.strength) + Constants.getEquippedEnchantments("strength", p1Creature, currentBattlefield["enchantments"]);

        if (p2Creature != "none")
        {
          var p2Power = parseInt(p2Creature.power) + Constants.getEquippedEnchantments("power", p2Creature, opponentBattlefield["enchantments"]);
          var p2Strength = parseInt(p2Creature.strength) + Constants.getEquippedEnchantments("strength", p2Creature, opponentBattlefield["enchantments"]);

          var p1StartingPower = p1Power;
          var p1StartingStrength = p1Strength;
          var p2StartingPower = p2Power;
          var p2StartingStrength = p2Strength;

          p1Strength -= p2Power;
          p2Strength -= p1Power;

          if (p1Strength <= 0 && !p1Creature.attributes.includes("indestructible"))
            attackerCreaturesThatDied.push(p1Creature);
          if (p2Strength <= 0 && !p2Creature.attributes.includes("indestructible"))
            opponentCreaturesThatDied.push(p2Creature);
        }
        else {
          opponent_health -= p1Power;
        }
      }

      for(i = 0; i < attackerCreaturesThatDied.length; i++)
      {
        var bfIndex = -1;
        currentBattlefield["creatures"].forEach(function(creature) {
          if (creature.fieldID == attackerCreaturesThatDied[i].fieldID)
          {
            currentHand.graveyard.push(creature.cardID);
            bfIndex = currentBattlefield["creatures"].indexOf(creature);
          }
        });

        if (bfIndex < 0)
          return;

        currentBattlefield["creatures"].splice(bfIndex, 1);
      }

      for(i = 0; i < opponentCreaturesThatDied.length; i++)
      {
        var bfIndex = -1;
        opponentBattlefield["creatures"].forEach(function(creature) {
          if (creature.fieldID == opponentCreaturesThatDied[i].fieldID)
          {
            opponentHand.graveyard.push(creature.cardID);
            bfIndex = opponentBattlefield["creatures"].indexOf(creature);
          }
        });

        if (bfIndex < 0)
          return;

        opponentBattlefield["creatures"].splice(bfIndex, 1);
      }

      for (i = 0; i < currentBattlefield["creatures"].length; i++)
      {
        var creature = currentBattlefield["creatures"][i];
        if (creature.isDeclaredAttacker)
          creature.isTapped = creature.attributes.includes('vigilance') ? false : true;
      }

      var damageDealt = parseInt(opponent_userDataObj.mtg_health) - opponent_health;
      damageDealt = parseInt(opponent_userDataObj.mtg_damagedealt) + damageDealt;

      if (damageDealt < 0)
        damageDealt = 0;

      //await HandleConnection.callDBFunction("MYSQL-returnQuery", updateQuery);
      var now = Constants.moment().format(Constants.momentTimeFormat);
      var deaths = parseInt(opponent_userDataObj.mtg_deaths) + 1;
      var health = opponent_health;

      var updateGameDataQuery = `UPDATE mtg_gamedata SET mtg_currentBattlefield='${JSON.stringify(currentBattlefield)}', mtg_currentPhase='3' WHERE mtg_userID='${obj.id}';`;
      var updateUserDataQuery = `UPDATE mtg_user SET mtg_damagedealt='${damageDealt}', mtg_lastAttackDateTime=STR_TO_DATE('${now}','%m-%d-%Y %H:%i:%s')  WHERE mtg_userID='${obj.id}'`;

      var updateOpponentUserDataQuery = `UPDATE mtg_user SET mtg_health='${health}' WHERE mtg_userID='${opponent_userDataObj.mtg_userID}';`;
      var updateOpponentGameDataQuery = `UPDATE mtg_gamedata SET mtg_currentBattlefield='${JSON.stringify(opponentBattlefield)}' WHERE mtg_userID='${opponent_userDataObj.mtg_userID}';`;

      //await HandleConnection.callDBFunction("MYSQL-returnQuery", updateOpponentGameDataQuery);

      if (opponent_health <= 0)
      {
        var receivedCards = [];
        var receivedCardNameString = "";
        var currencyReceived = 0;

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

        for (i = 0; i< Constants.cardStealAmount; i++)
        {
          //console.log (opponent_gameDataObj);
          var cardIDFromDeck = opponentDeck.deck[Math.floor((Math.random() * opponentDeck.deck.length))]

          if (cardIDFromDeck != null) {
            var cardFromLibrary = cardIDFromDeck.startsWith("LAND") ? Constants.lands.filter(search => search.ID == cardIDFromDeck)[0] : Constants.cards.filter(search => search.ID == cardIDFromDeck)[0];
            receivedCards.push(cardFromLibrary);
            currentDeck.deck.push(cardIDFromDeck);
            var card_name = cardIDFromDeck.startsWith("LAND") ? cardFromLibrary.land : cardFromLibrary.card_name;
            var mana_string = cardIDFromDeck.startsWith("LAND") ? Constants.returnSingleManaByColor(cardFromLibrary.colors) : Constants.getManaString(JSON.parse(cardFromLibrary.mana_cost));
            receivedCardNameString += mana_string + card_name + " (" + cardIDFromDeck + ")\n\t\t";
            //console.log(mana_string);
          }
        }

        currentDeck.deck = Constants.shuffle(currentDeck.deck);
        var total = (opponentBattlefield.lands.length + opponentDeck.deck.length + opponentHand.graveyard.length);
        var currencyReceived = Constants.baseCurrencyWinAmount + Math.floor((Math.random() * total));
        var currencyUpdate = parseInt(userDataObj.mtg_currency + currencyReceived);// / Constants.gemPercentage) * 100)).toFixed();
        var kills = parseInt(userDataObj.mtg_kills) + 1;

        var XPReceived = Constants.baseXPWinAmount + Math.floor((Math.random() * currencyReceived));
        var XPUpdate = parseInt(userDataObj.mtg_rankxp + XPReceived);
        var lastXPTier = Constants.returnTierByXP(userDataObj.mtg_rankxp);
        var newXPTier = Constants.returnTierByXP(XPUpdate);
        var promotionString = lastXPTier != newXPTier ? `${Constants.emoji_id.balloon}**PROMOTION!!** You have reached ${newXPTier.emoji_id}${newXPTier.rank} Tier ${newXPTier.tierText}! ${Constants.emoji_id.balloon}\n\n` : '\n';


        obj.message.reply(`you killed <@${opponent_userDataObj.mtg_userID}>!
          You received <:currency:${Constants.emoji_id.currency}>${String(currencyReceived)}, <:exp:${Constants.emoji_id.exp}> ${XPReceived} XP and ${receivedCards.length} new cards were added to your deck!\n` +
          `\t\t` + promotionString +
          `\t\t` + receivedCardNameString
        );

        updateUserDataQuery = `UPDATE mtg_user SET mtg_damagedealt='${damageDealt}', mtg_currency='${currencyUpdate}', mtg_rankxp='${XPUpdate}', mtg_kills='${kills}', mtg_lastAttackDateTime=STR_TO_DATE('${now}','%m-%d-%Y %H:%i:%s') WHERE mtg_userID='${obj.id}'`;
        updateGameDataQuery = `UPDATE mtg_gamedata SET mtg_currentBattlefield='${JSON.stringify(currentBattlefield)}', mtg_currentDeck='${JSON.stringify(currentDeck)}', mtg_currentPhase='3' WHERE mtg_userID='${obj.id}';`;

        updateOpponentUserDataQuery = `UPDATE mtg_user SET mtg_health='${health}', mtg_lastDeathDateTime=STR_TO_DATE('${now}','%m-%d-%Y %H:%i:%s'), mtg_deaths='${deaths}', mtg_reset='1' WHERE mtg_userID='${opponent_userDataObj.mtg_userID}';`;
        updateOpponentGameDataQuery = `UPDATE mtg_gamedata SET mtg_currentBattlefield='${JSON.stringify(newBattlefield)}', mtg_currentDeck='${JSON.stringify(newDeck)}', mtg_currentHand='${JSON.stringify(newHand)}' WHERE mtg_userID='${opponent_userDataObj.mtg_userID}';`;
      }

      await HandleConnection.callDBFunction('MYSQL-fireAndForget', updateUserDataQuery);
      await HandleConnection.callDBFunction('MYSQL-fireAndForget', updateGameDataQuery);
      await HandleConnection.callDBFunction('MYSQL-fireAndForget', updateOpponentGameDataQuery);
      await HandleConnection.callDBFunction('MYSQL-fireAndForget', updateOpponentUserDataQuery);
      //NextPhase.goToPhaseThree(obj, gameDataObj);

      Constants.removeIDRequest(opponentID);
  }
}

module.exports = local;
HandleFunctionCall.RegisterFunction(["a", "at", "attack", "combat", "fight", "begincombat"], local.attack);
