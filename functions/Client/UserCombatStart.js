const Constants = require('../util/Constants');
const HandleConnection = require('../handle/HandleConnection');
const HandleFunctionCall = require('../HandleFunctionCall');
const NextPhase = require('./UserNextPhase');

async function printMatchUp(obj, opponentID, combat_result, attackingCreaturesThatDied, defendingCreaturesThatDied, attackerHealth, opponentHealth)        //(obj, opponent, matchUps, p1Battlefield, p2Battlefield)
{
  var string = ``;

  var attacker = obj.message.author;
  var opponent = await obj.message.guild.members.fetch(opponentID);

  //console.log(attacker);
  //console.log(opponent);

  //console.log(combat_result);

  var victoryStatus = attackingCreaturesThatDied.length > defendingCreaturesThatDied.length ? `- [Defender Victory]` : `- [Attacker Victory]`;

  if (attackingCreaturesThatDied.length == defendingCreaturesThatDied.length)
    victoryStatus = `- [DRAW]`;

  const embed = new Constants.Discord.MessageEmbed()
    //console.log(obj.result[0].mtg_startingDeck);
    .setTitle(`[${Constants.emoji_id.heart} ${attackerHealth}] ${attacker.username} ${Constants.emoji_id.sword} [${Constants.emoji_id.heart} ${opponentHealth}] ${opponent.user.username}`)
    .setColor(Constants.color_codes['red'])
    .addField(`Battle Results ${victoryStatus}`, `Attacker Losses: ${attackingCreaturesThatDied.length} | Defender Losses: ${defendingCreaturesThatDied.length}`, true)
    //.addField("Total Number of Cards", currentHand.hand.length, true)
    //.addField("Total Size of Deck", currentDeck.deck.length, true);

  combat_result.forEach((matchUp) => {

    var creature = matchUp.attackingCreature;
    var attackerCreatureCardFromLibrary = Constants.cards.filter(search => search.ID == creature.cardID)[0];
    var attackerCreatureName = attackerCreatureCardFromLibrary.card_name;
    var EmbedTitleString = `${attackerCreatureName} ${Constants.emoji_id.sword} `;
    var attackerStatusString = creature.died ? `(DIED)` : `(SURVIVED)`;
    var defenderString = `${attackerStatusString} ${attackerCreatureName} ${creature.power}/${creature.strength} | `;

    var defenders = combat_result.filter(matchup => matchup.attackingCreature == creature)[0].defendingCreatures;
    var defender_losses = combat_result.filter(matchup => matchup.attackingCreature == creature)[0].defenderLosses;

    if (defenders.length == 0)
    {
      EmbedTitleString += `${opponent.user.username}`;
      defenderString += `${opponent.user.username} DMG TAKEN: ${creature.damageDealtToPlayer}`;
    }

    defenders.forEach((defender) => {
      var defenderCreatureFromLibrary = Constants.cards.filter(search => search.ID == defender.cardID)[0];
      var defenderCreatureName = defenderCreatureFromLibrary.card_name;
      var defenderStatusString = defender.died ? `(DIED)` : `(SURVIVED)`;

      //var defenderExtraString = 

      EmbedTitleString += defenderCreatureName + ` | `;
      EmbedTitleString = EmbedTitleString.substring(0, EmbedTitleString.length-3);
      defenderString += `${defenderStatusString} ${defenderCreatureName} ${defender.power}/${defender.strength} | `;
      defenderString = defenderString.substring(0, defenderString.length-3);
    })

    //string += `\n`;
    embed.addField(`${EmbedTitleString}`, `${defenderString}`, false);

  });
  /*for (i = 0; i < matchUps.length; i++)
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
  }*/

    /*const embed = new Constants.Discord.MessageEmbed()
    //console.log(obj.result[0].mtg_startingDeck);
    .setTitle(`<@${obj.id}> ${Constants.emoji_id.sword} <@${opponent_userDataObj.mtg_userID}>`);
    .setColor(Constants.color_codes['red']);
    .addField("Available Mana", Constants.getAvailableMana(currentBattlefield), false)
    .addField("Total Number of Cards", currentHand.hand.length, true)
    .addField("Total Size of Deck", currentDeck.deck.length, true);
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

      var isCreatureDisplayStatsString = card.type == 'creature' ? `| ${card.power}/${card.strength}` : ``;
      embed.addField(card.ID.startsWith("LAND") ? "Land" : card.type.capitalize(), card.ID.startsWith("LAND") ? `(${card.ID.substring(5, card.ID.length)}) ${Constants.returnManaByColorTable(card.colors)}${card.land}` : `(${card.ID.substring(4, card.ID.length)}) ${mana_string}${card.card_name} ${isCreatureDisplayStatsString}`, false);
    }*/


  return obj.message.reply({embed});
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

      await Constants.until(_ => Constants.commandRequests.includes(opponentID) == false);
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

      attackerCreatures.forEach((creature) => {
        var cardFromLibrary = Constants.cards.filter(search => search.ID == creature.cardID);

        //console.log(creature);
        //console.log(cardFromLibrary);
        if (typeof(creature.attributes) == typeof("STRING") || creature.attributes == [])
          creature.attributes = JSON.parse(cardFromLibrary[0].attributes);
      });

      defenderCreatures.forEach((creature) => {
        var cardFromLibrary = Constants.cards.filter(search => search.ID == creature.cardID);

        if (typeof(creature.attributes) == typeof("STRING") || creature.attributes == [])
          creature.attributes = JSON.parse(cardFromLibrary[0].attributes);
      });


      //var battlefield_data = {};
      var battlefield = local.prepareCombat({id: obj.id, battlefield: currentBattlefield}, {id: opponentID, battlefield: opponentBattlefield});

      var combat_result = local.doCombat(battlefield, currentBattlefield, opponentBattlefield);

      //console.log(combat_result);

      var attackerCreaturesThatDied = [];
      var opponentCreaturesThatDied = [];

      var damageDealtToPlayer = 0;
      var damageDealtToCreatures = 0;
      var attackerHealAmount = 0;
      var opponentHealAmount = 0;
      var opponentDamageDealt = 0; 

      combat_result.forEach((matchUp) => {

        var checked = [];


        if (matchUp.attackerLosses.length > 0) {
          matchUp.attackerLosses.forEach((creature) => {
            //console.log(`attacker losses:`);
            //console.log(creature);
            attackerHealAmount += matchUp.attackingCreature.attributes.includes('lifelink') ? matchUp.attackingCreature.lifeGained : 0;
            attackerCreaturesThatDied.push(creature);
            checked.push(creature);
            damageDealtToPlayer += creature.damageDealtToPlayer;
            for (i = 0; i < creature.damageDealt.length; i++)
            {
              //console.log(creature.damageDealt[i])
              damageDealtToCreatures += creature.damageDealt[i];
            }
          });
        }

        if (matchUp.defenderLosses.length > 0) {
          matchUp.defenderLosses.forEach((creature) => {
            opponentHealAmount += creature.attributes.includes('lifelink') ? creature.lifeGained : 0;
            opponentCreaturesThatDied.push(creature);
            checked.push(creature);

            for (i = 0; i < creature.damageDealt.length; i++)
            {
              //console.log(creature);
              //console.log(creature.damageDealt[i])
              opponentDamageDealt += creature.damageDealt[i];
            }
          });
        }

        if (!checked.includes(matchUp.attackingCreature))
        {
          attackerHealAmount += matchUp.attackingCreature.attributes.includes('lifelink') ? matchUp.attackingCreature.lifeGained : 0;
          checked.push(matchUp.attackingCreature);
          damageDealtToPlayer += matchUp.attackingCreature.damageDealtToPlayer;
          for (i = 0; i < matchUp.attackingCreature.damageDealt.length; i++)
          {
              //console.log(creature);
              //console.log(creature.damageDealt[i])
              damageDealtToCreatures += matchUp.attackingCreature.damageDealt[i];
          }
        }


        matchUp.defendingCreatures.forEach((creature) => {
          if (!checked.includes(creature))
          {
            checked.push(creature);
            opponentHealAmount += creature.attributes.includes('lifelink') ? creature.lifeGained : 0;

            for (i = 0; i < creature.damageDealt.length; i++)
            {
              //console.log(creature);
              //console.log(creature.damageDealt[i])
              opponentDamageDealt += creature.damageDealt[i];
            }
          }
        });

      });

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
        var cardFromLibrary = Constants.cards.filter(search => search.ID == creature.cardID);

        if (typeof(creature.attributes) == typeof("STRING"))
          creature.attributes = JSON.parse(cardFromLibrary[0].attributes);

        if (creature.attributes.creature_attributes == null || creature.attributes.creature_attributes == undefined) {
          creature.isTapped = true;
          continue;
        }

        if (creature.isDeclaredAttacker)
          creature.isTapped = creature.attributes.creature_attributes.includes('vigilance') ? false : true;
      }



      //message.edit(`<@${obj.id}> ${Constants.emoji_id.sword} <@${opponent_userDataObj.mtg_userID}> \n\n${getMatchUpString(combat_result, attackerCreaturesThatDied, opponentCreaturesThatDied)}`);
      message.delete({ timeout: 3000 });


      var attacker_health = parseInt(userDataObj.mtg_health) + attackerHealAmount;
      var opponent_health = parseInt(opponent_userDataObj.mtg_health);

      opponent_health -= damageDealtToPlayer;
      opponent_health += opponentHealAmount;

      await printMatchUp(obj, opponentID, combat_result, attackerCreaturesThatDied, opponentCreaturesThatDied, attacker_health, opponent_health);

      if (attackerHealAmount > 0)
        obj.message.reply(` you gained ${attackerHealAmount} life from your lifelink creatures!`);


      var now = Constants.moment().format(Constants.momentTimeFormat);

      var damageDealt = parseInt(userDataObj.mtg_damagedealt) + damageDealtToPlayer + damageDealtToCreatures;
      var opponentDamageDealtUpdated = parseInt(opponent_userDataObj.mtg_damagedealt) + opponentDamageDealt;



      //console.log(damageDealt);
      //console.log(opponentDamageDealtUpdated);

      if (opponent_health <= 0) 
      {
        var deaths = parseInt(opponent_userDataObj.mtg_deaths) + 1;
        //var health = opponent_health;

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
            var mana_string = cardIDFromDeck.startsWith("LAND") ? Constants.returnManaByColorTable(cardFromLibrary.colors) : Constants.getManaString(JSON.parse(cardFromLibrary.mana_cost));
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

        updateUserDataQuery = `UPDATE mtg_user SET mtg_health='${attacker_health}', mtg_damagedealt='${damageDealt}', mtg_currency='${currencyUpdate}', mtg_rankxp='${XPUpdate}', mtg_kills='${kills}', mtg_lastAttackDateTime=STR_TO_DATE('${now}','%m-%d-%Y %H:%i:%s') WHERE mtg_userID='${obj.id}'`;
        updateGameDataQuery = `UPDATE mtg_gamedata SET mtg_currentBattlefield='${JSON.stringify(currentBattlefield)}', mtg_currentDeck='${JSON.stringify(currentDeck)}', mtg_currentPhase='3' WHERE mtg_userID='${obj.id}';`;

        updateOpponentUserDataQuery = `UPDATE mtg_user SET mtg_health='${opponent_health}', mtg_damagedealt='${opponentDamageDealtUpdated}', mtg_lastDeathDateTime=STR_TO_DATE('${now}','%m-%d-%Y %H:%i:%s'), mtg_deaths='${deaths}', mtg_reset='1' WHERE mtg_userID='${opponent_userDataObj.mtg_userID}';`;
        updateOpponentGameDataQuery = `UPDATE mtg_gamedata SET mtg_currentBattlefield='${JSON.stringify(newBattlefield)}', mtg_currentDeck='${JSON.stringify(newDeck)}', mtg_currentHand='${JSON.stringify(newHand)}' WHERE mtg_userID='${opponent_userDataObj.mtg_userID}';`;

        await HandleConnection.callDBFunction('MYSQL-fireAndForget', updateUserDataQuery);
        await HandleConnection.callDBFunction('MYSQL-fireAndForget', updateGameDataQuery);
        await HandleConnection.callDBFunction('MYSQL-fireAndForget', updateOpponentGameDataQuery);
        await HandleConnection.callDBFunction('MYSQL-fireAndForget', updateOpponentUserDataQuery);
      }
      else
      {
        var total = (opponentBattlefield.lands.length + opponentDeck.deck.length + opponentHand.graveyard.length);
        var currencyReceived = Constants.baseCurrencyWinAmount + Math.floor((Math.random() * total));
        var currencyUpdate = parseInt(userDataObj.mtg_currency + currencyReceived);// / Constants.gemPercentage) * 100)).toFixed();
        var kills = parseInt(userDataObj.mtg_kills) + 1;

        var XPReceived = Constants.baseXPWinAmount + Math.floor((Math.random() * currencyReceived));
        var XPUpdate = parseInt(userDataObj.mtg_rankxp + XPReceived);
        var lastXPTier = Constants.returnTierByXP(userDataObj.mtg_rankxp);
        var newXPTier = Constants.returnTierByXP(XPUpdate);
        var promotionString = lastXPTier != newXPTier ? `${Constants.emoji_id.balloon}**PROMOTION!!** You have reached ${newXPTier.emoji_id}${newXPTier.rank} Tier ${newXPTier.tierText}! ${Constants.emoji_id.balloon}\n\n` : '\n';

        obj.message.reply(`you received <:currency:${Constants.emoji_id.currency}>${String(currencyReceived)}, <:exp:${Constants.emoji_id.exp}> ${XPReceived} XP!\n` + `\t\t` + promotionString);

        var updateGameDataQuery = `UPDATE mtg_gamedata SET mtg_currentBattlefield='${JSON.stringify(currentBattlefield)}', mtg_currentPhase='3' WHERE mtg_userID='${obj.id}';`;
        var updateUserDataQuery = `UPDATE mtg_user SET mtg_damagedealt='${damageDealt}', mtg_health='${attacker_health}', mtg_currency='${currencyUpdate}', mtg_rankxp='${XPUpdate}', mtg_lastAttackDateTime=STR_TO_DATE('${now}','%m-%d-%Y %H:%i:%s')  WHERE mtg_userID='${obj.id}'`;

        var updateOpponentUserDataQuery = `UPDATE mtg_user SET mtg_damagedealt='${opponentDamageDealtUpdated}', mtg_health='${opponent_health}' WHERE mtg_userID='${opponent_userDataObj.mtg_userID}';`;
        var updateOpponentGameDataQuery = `UPDATE mtg_gamedata SET mtg_currentBattlefield='${JSON.stringify(opponentBattlefield)}' WHERE mtg_userID='${opponent_userDataObj.mtg_userID}';`;

        await HandleConnection.callDBFunction('MYSQL-fireAndForget', updateUserDataQuery);
        await HandleConnection.callDBFunction('MYSQL-fireAndForget', updateGameDataQuery);
        await HandleConnection.callDBFunction('MYSQL-fireAndForget', updateOpponentGameDataQuery);
        await HandleConnection.callDBFunction('MYSQL-fireAndForget', updateOpponentUserDataQuery);
      }

      //console.log("-------------");

      //console.log(combat_result[0].defendingCreatures);

      //opponentBattlefield
      


      //NextPhase.goToPhaseThree(obj, gameDataObj);

      Constants.removeIDRequest(opponentID);
      Constants.removeIDRequest(obj.id);
  },

  prepareCombat:function(attacker, defender)
  {
    var battlefield = {
      attacker: {
        id: attacker.id,
        creatures: []
      },
      defender: {
        id: defender.id,
        creatures: []
      },
      matchUp: [

      ]
    };

    //console.log(defender.battlefield);

    var attackerCreatures = attacker.battlefield["creatures"].filter(creature => creature.isDeclaredAttacker == true && !creature.isTapped);
    var defenderCreatures = defender.battlefield["creatures"].filter(creature => creature.isDeclaredDefender == true && !creature.isTapped);

    var totalAttackers = attackerCreatures.length;
    var totalDefenders = defenderCreatures.length;

    //console.log(`attackers: ${totalAttackers}`);
    //console.log(`defenders: ${totalDefenders}`);

    attackerCreatures.forEach((creature) =>{
      var cardFromLibrary = Constants.cards.filter(search => search.ID == creature.cardID)[0];
      var attributes = JSON.parse(cardFromLibrary.attributes);

      //console.log(attributes);

      var creatureAttributes = [];
      var triggerAttributes = [];

      if (attributes != null && attributes != undefined) { 
        if (attributes.creature_attributes != undefined && attributes.creature_attributes != null)
          creatureAttributes = attributes.creature_attributes;

        if (attributes.triggers != undefined && attributes.creature_attributes != null)
          triggerAttributes = attributes.triggers;
      }

      var creatureData = {
        fieldID: creature.fieldID,
        cardID: creature.cardID,
        attributes: creatureAttributes,
        triggers: triggerAttributes,
        isFlying: creatureAttributes.includes('flying') == true,
        hasReach: creatureAttributes.includes('reach') == true,
        power: creature.power + Constants.getEquippedEnchantments("power", creature, attacker.battlefield["enchantments"]),
        strength: creature.strength + Constants.getEquippedEnchantments("strength", creature, attacker.battlefield["enchantments"]),
        damageTaken: 0,
        damageDone: 0,
        lifeGained: 0,
        died: false,
        equipped_cards: creature.equipped_cards,
        attacking: [],
        defending: []
      }
      battlefield.attacker.creatures.push(creatureData);
    });

    defenderCreatures.forEach((creature) =>{
      var cardFromLibrary = Constants.cards.filter(search => search.ID == creature.cardID)[0];
      var attributes = JSON.parse(cardFromLibrary.attributes);

      var creatureAttributes = [];
      var triggerAttributes = [];

      if (attributes != null && attributes != undefined) { 
        if (attributes.creature_attributes != undefined && attributes.creature_attributes != null)
          creatureAttributes = attributes.creature_attributes;

        if (attributes.triggers != undefined && attributes.creature_attributes != null)
          triggerAttributes = attributes.triggers;
      }

      var creatureData = {
        fieldID: creature.fieldID,
        cardID: creature.cardID,
        attributes: creatureAttributes,
        triggers: triggerAttributes,
        isFlying: creatureAttributes.includes('flying') == true,
        hasReach: creatureAttributes.includes('reach') == true,
        power: creature.power + Constants.getEquippedEnchantments("power", creature, defender.battlefield["enchantments"]),
        strength: creature.strength + Constants.getEquippedEnchantments("strength", creature, defender.battlefield["enchantments"]),
        damageTaken: 0,
        damageDone: 0,
        lifeGained: 0,
        died: false,
        equipped_cards: creature.equipped_cards,
        attacking: [],
        defending: []
      }

      battlefield.defender.creatures.push(creatureData);
    });

    var attackerCreaturesShuffled = Constants.shuffle(battlefield.attacker.creatures);
    var defenderCreaturesShuffled = Constants.shuffle(battlefield.defender.creatures);

    battlefield.attacker.creatures = attackerCreaturesShuffled;
    battlefield.defender.creatures = defenderCreaturesShuffled;


    battlefield.attacker.creatures.forEach((creature) => {
      var targets = local.findSuitableTarget(creature, battlefield);
      var indexOfAttackingCreature = battlefield.attacker.creatures.indexOf(creature);

      //console.log(targets);

      var defenderIDs = [];

      targets.forEach((target) => {
        battlefield.attacker.creatures[indexOfAttackingCreature].attacking.push(target.fieldID);

        var defendingCreatureIndex = battlefield.defender.creatures.indexOf(target);
        //var defendingCreature = battlefield.defender.creatures[defendingCreatureIndex];

        //defendingCreature.defending.push(creature.fieldID)
        battlefield.defender.creatures[defendingCreatureIndex].defending.push(creature.fieldID);
        defenderIDs.push(target.fieldID);
      });

      var newMatchUp = {
        battleID: battlefield.matchUp.length,
        attacker: creature.fieldID,
        defenders: defenderIDs
      }

      battlefield.matchUp.push(newMatchUp)
    });

    //console.log(battlefield);

    //console.log(battlefield.defender.creatures);
    //console.log(battlefield.attacker.creatures);

    return battlefield;
  },

  findSuitableTarget:function(creature, battlefield)
  {
    var targets = [];

    var attackerCanFly = creature.isFlying;

    var defenders = battlefield.defender.creatures.filter(defendingCreature => defendingCreature.defending.length == 0);

    //console.log(defenders);

    if (defenders.length == 0)
    {
      console.log("No defenders - attack player instead");
      return targets;
    }

    if (attackerCanFly)
    {
      var defendersWithReachOrFlying = defenders.filter(defendingCreature => (defendingCreature.hasReach == true || defendingCreature.isFlying == true));

      if (defendersWithReachOrFlying.length == 0) 
      {
        console.log("No creatures with reach found");

        var defenderNeededAmount = creature.attributes.includes('menace') ? 2 : 1;

        if (creature.attributes.includes('menace')) 
        {
          var menaceTargets = [];
          //var canBlock = true;

          if (defendersWithReach.length < 2)
          {
            console.log('flying - not enough defenders with reach');
            return targets;
          }

          while (menaceTargets.length < 2)
          {
            var randomDefender = defendersWithReachOrFlying[Math.floor((Math.random() * defendersWithReachOrFlying.length))]

            if (!menaceTargets.includes(randomDefender))
            {
              menaceTargets.push(randomDefender);
              targets.push(randomDefender);
            }
          }
        }
        else
        {
          console.log('flying - does not have menace');
          var randomDefender = defendersWithReachOrFlying[Math.floor((Math.random() * defendersWithReachOrFlying.length))]
        }
      }
      else
      {
        console.log('flying - no defenders with reach');
        return targets;
      }
    }
    else
    {
      if (creature.attributes.includes('menace')) 
      {
        var menaceTargets = [];
        //var canBlock = true;

        if (defenders.length < 2)
        {
          console.log('land combat - not enough defenders');
          return targets;
        }

        while (menaceTargets.length < 2)
        {
          var randomDefender = defenders[Math.floor((Math.random() * defenders.length))]

          if (!menaceTargets.includes(randomDefender))
          {
            menaceTargets.push(randomDefender);
            targets.push(randomDefender);
          }
        }
      }
      else
      {
        console.log('land combat - does not have menace');
        var randomDefender = defenders[Math.floor((Math.random() * defenders.length))]

        //console.log(randomDefender);

        targets.push(randomDefender);
      }
    }

    return targets;
  },

  doCombat:function(battlefield, attackerBattlefield, defenderBattlefield)
  {
    var battle_results = [];

    battlefield.matchUp.forEach((matchUp) => {

      var attackingCreature = attackerBattlefield["creatures"].filter(creature => creature.fieldID == matchUp.attacker)[0];
      var creatureCardFromLibrary = Constants.cards.filter(search => search.ID == attackingCreature.cardID)[0];
      var attributes = JSON.parse(creatureCardFromLibrary.attributes);

      var creatureAttributes = [];
      var triggerAttributes = [];

      if (attributes != null && attributes != undefined) { 
        if (attributes.creature_attributes != undefined && attributes.creature_attributes != null)
          creatureAttributes = attributes.creature_attributes;

        if (attributes.triggers != undefined && attributes.creature_attributes != null)
          triggerAttributes = attributes.triggers;
      }

      var fight = {
        battleID: matchUp.battleID,
        attackingCreature: {
          fieldID: attackingCreature.fieldID,
          cardID: attackingCreature.cardID,
          attributes: creatureAttributes,
          triggers: triggerAttributes,
          power: attackingCreature.power + Constants.getEquippedEnchantments("power", attackingCreature, attackerBattlefield["enchantments"]),
          strength: attackingCreature.strength + Constants.getEquippedEnchantments("strength", attackingCreature, attackerBattlefield["enchantments"]),
          damageTaken: 0,
          damageDealt: [],
          damageDealtToPlayer: 0,
          lifeGained: 0,
          died: false,
          equipped_cards: attackingCreature.equipped_cards,
        },
        defendingCreatures: [],
        attackerLosses: [],
        defenderLosses: []
      };

      //console.log(battlefield);

      matchUp.defenders.forEach((defenderID) => {

        var defendingCreature = defenderBattlefield["creatures"].filter(creature => creature.fieldID == defenderID)[0];
        var creatureCardFromLibrary = Constants.cards.filter(search => search.ID == defendingCreature.cardID)[0];
        var attributes = JSON.parse(creatureCardFromLibrary.attributes);

        var creatureAttributes = [];
        var triggerAttributes = [];

        if (attributes != null && attributes != undefined) { 
          if (attributes.creature_attributes != undefined && attributes.creature_attributes != null)
            creatureAttributes = attributes.creature_attributes;

          if (attributes.triggers != undefined && attributes.creature_attributes != null)
            triggerAttributes = attributes.triggers;
        }


        var defendingCreatureData = {
          fieldID: defendingCreature.fieldID,
          cardID: defendingCreature.cardID,
          attributes: creatureAttributes,
          triggers: triggerAttributes,
          power: defendingCreature.power + Constants.getEquippedEnchantments("power", defendingCreature, attackerBattlefield["enchantments"]),
          strength: defendingCreature.strength + Constants.getEquippedEnchantments("strength", defendingCreature, attackerBattlefield["enchantments"]),
          damageTaken: 0,
          damageDealt: [],
          damageDealtToPlayer: 0,
          lifeGained: 0,
          died: false,
          equipped_cards: attackingCreature.equipped_cards,
        };

        fight.defendingCreatures.push(defendingCreatureData);

      });

      if (fight.defendingCreatures.length > 0) 
      {
        var leftoverAttackerPower = 0;

        for (i = 0; i < fight.defendingCreatures.length; i++)
        {
          var result = local.fightCreature(fight.attackingCreature, fight.defendingCreatures[i]);
          //fight.attackingCreature.damageDealt.push(result.attacker.damageDealtToCreature);
          fight.attackingCreature.damageDealtToPlayer += result.attacker.damageDealtToPlayer;
          fight.attackingCreature.lifeGained += result.attacker.DamageInflicted;
          fight.defendingCreatures[i].lifeGained += result.defender.DamageInflicted;
          fight.defendingCreatures[i].strength = result.defender.LeftoverStrength;
          fight.defendingCreatures[i].power = result.defender.LeftoverPower;

          if (i == (fight.defendingCreatures.length - 1) && fight.attackingCreature.attributes.includes('trample') && !result.attackerDied && result.defenderDied) //if trample
            leftoverAttackerPower += result.attacker.LeftoverPower;

          if (result.defenderDied)
          {
            console.log("defender died");
            fight.defendingCreatures[i].died = true;
            fight.defendingCreatures[i].damageTaken += result.attacker.DamageInflicted;
            fight.defendingCreatures[i].strength = 0;
            fight.defendingCreatures[i].power = result.defender.LeftoverPower;
            fight.defendingCreatures[i].damageDealt.push(result.defender.DamageInflicted);
            fight.defenderLosses.push(fight.defendingCreatures[i]);
          };

          if (result.attackerDied)
          {
            console.log("attacking creature died");
            fight.attackingCreature.died = true;
            fight.attackingCreature.strength = 0;
            fight.attackingCreature.power = result.attacker.LeftoverPower
            fight.attackingCreature.damageDealt.push(result.attacker.DamageInflicted);
            fight.attackingCreature.damageTaken += result.defender.DamageInflicted;
            fight.attackerLosses.push(fight.attackingCreature);
            break;
          }
          else
          {
            //var left

            console.log("continue next battle if available");
            fight.attackingCreature.power = result.attacker.LeftoverPower;
            fight.attackingCreature.strength = result.attacker.LeftoverStrength;
            fight.attackingCreature.damageDealt.push(result.attacker.DamageInflicted);
            fight.attackingCreature.damageTaken += result.defender.DamageInflicted;
            continue;
          }
        }

        fight.attackingCreature.damageDealtToPlayer = leftoverAttackerPower;
      }
      else
      {
        console.log("attackingCreature will deal damage directly to player");
        var doubleStrike = (fight.attackingCreature.attributes.includes('double strike') == true) ? 2 : 1;

        fight.attackingCreature.damageDealtToPlayer = fight.attackingCreature.power * doubleStrike;

        if (fight.attackingCreature.attributes.includes('lifelink'))
        {
          fight.attackingCreature.lifeGained = fight.attackingCreature.power * doubleStrike;
        }
      }

      battle_results.push(fight);
    });

    return battle_results;
  },

  fightCreature:function(attackingCreature, defendingCreature)
  {
    /*var battleId = fight.battleID;
    var attackingCreature = fight.attackingCreature;
    var defendingCreatures = fight.defendingCreatures;*/

    var result = {
      attackerDied: false,
      defenderDied: false,
      attacker: {
        LeftoverPower: 0,
        LeftoverStrength: 0,
        DamageInflicted: 0,
        damageDealtToPlayer: 0
      },
      defender: {
        LeftoverPower: 0,
        LeftoverStrength: 0,
        DamageInflicted: 0,
        damageDealtToPlayer: 0
      }
    };


    var attackerPower = attackingCreature.power;
    var attackerStrength = attackingCreature.strength;

    var defenderPower = defendingCreature.power;
    var defenderStrength = defendingCreature.strength;

    /*console.log(`attackerPower: ${attackerPower}`);
    console.log(`attackerStrength: ${attackerStrength}`);

    console.log(`defenderPower: ${defenderPower}`);
    console.log(`defenderStrength: ${defenderStrength}`);*/


    if (attackingCreature.attributes.includes('first strike'))
    {
      var attacker_powerNeededToKill = attackerPower > defenderStrength ? defenderStrength : attackerPower;

      if (attacker_powerNeededToKill >= defenderStrength)
      {
        result.defenderDied = true;
      }

      result.attacker.DamageInflicted = attacker_powerNeededToKill;
      result.attacker.LeftoverPower = attackerPower - attacker_powerNeededToKill;
      result.attacker.LeftoverStrength = attackerStrength;

      if (attackingCreature.attributes.includes('deathtouch'))
      {
        result.defenderDied = true;
      }

      if (defendingCreature.attributes.includes('deathtouch'))
      {
        result.attackerDied = true;
      }


      if (attackingCreature.attributes.includes('indestructible'))
        result.attackerDied = false;

      if (defendingCreature.attributes.includes('indestructible'))
        result.defenderDied = false;

      return result;
    }
    else if (defendingCreature.attributes.includes('first strike'))
    {
      var defender_powerNeededToKill = defenderPower > attackerStrength ? attackerStrength : defenderPower;

      if (defender_powerNeededToKill >= attackerStrength)
      {
        result.attackerDied = true;
      }

      result.defender.DamageInflicted = defender_powerNeededToKill;
      result.defender.LeftoverPower = defenderPower - defender_powerNeededToKill;
      result.defender.LeftoverStrength = defenderStrength;

      if (attackingCreature.attributes.includes('deathtouch'))
      {
        result.defenderDied = true;
      }

      if (defendingCreature.attributes.includes('deathtouch'))
      {
        result.attackerDied = true;
      }


      if (attackingCreature.attributes.includes('indestructible'))
        result.attackerDied = false;

      if (defendingCreature.attributes.includes('indestructible'))
        result.defenderDied = false;

      return result;
    }
    else
    {
      var attacker_powerNeededToKill = attackerPower > defenderStrength ? defenderStrength : attackerPower;

      //console.log(`attacker_powerNeededToKill: ${attacker_powerNeededToKill}`);

      if (attacker_powerNeededToKill >= defenderStrength)
      {
        //console.log('defender received lethal damage');
        result.defenderDied = true;
      }

      result.attacker.DamageInflicted = attacker_powerNeededToKill;
      result.attacker.LeftoverPower = attackerPower - attacker_powerNeededToKill;
      result.attacker.LeftoverStrength = (attackerStrength - defenderPower) < 0 ? 0 : (attackerStrength - defenderPower);

      var defender_powerNeededToKill = defenderPower > attackerStrength ? attackerStrength : defenderPower;

      //console.log(`defender_powerNeededToKill: ${defender_powerNeededToKill}`);

      if (defender_powerNeededToKill >= attackerStrength)
      {
        //console.log('attacker received lethal damage');
        result.attackerDied = true;
      }

      result.defender.DamageInflicted = defender_powerNeededToKill;
      result.defender.LeftoverPower = defenderPower - defender_powerNeededToKill;
      result.defender.LeftoverStrength = (defenderStrength - attackerPower) < 0 ? 0 : (defenderStrength - attackerPower);

      if (attackingCreature.attributes.includes('deathtouch'))
      {
        result.defenderDied = true;
      }

      if (defendingCreature.attributes.includes('deathtouch'))
      {
        result.attackerDied = true;
      }


      if (attackingCreature.attributes.includes('indestructible'))
        result.attackerDied = false;

      if (defendingCreature.attributes.includes('indestructible'))
        result.defenderDied = false;

      //console.log(result.attacker.LeftoverPower);
      //console.log(result.attacker.LeftoverStrength);

      return result;
    }

    return result;

  },

  triggertest:function(cmd, args)
  {
    var msgOwnerID = cmd.author.id;
    var channelId = cmd.channel.id;

    var obj = {
      id: msgOwnerID,
      messageObj: cmd,
      messageArgs: args,
      callback: local.trigger
    };

    Constants.SQL.emit('check-user-exists', obj)

    //console.log(obj.message);
    //Constants.triggerEvent("201841156990959616", null, null, "onCardDraw", null, null, null, obj.message);
  },

  trigger:function(obj)
  {
    Constants.triggerEvent("201841156990959616", null, null, "onCardDraw", null, null, null, obj);
  }
}

module.exports = local;
HandleFunctionCall.RegisterFunction(["a", "at", "attack", "combat", "fight", "begincombat"], local.attack);
HandleFunctionCall.RegisterFunction(["trigger"], local.triggertest);
