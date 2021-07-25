const Constants = require('../util/Constants');
const HandleConnection = require('../handle/HandleConnection');
const HandleFunctionCall = require('../HandleFunctionCall');

async function declareCreatures(obj, attackerState, defenderState, msg)
{
  Constants.pushIDRequest(obj.id);

  //console.log("declare creatures");

  var gameData = await HandleConnection.callDBFunction("MYSQL-returnQuery", "SELECT * FROM mtg_gamedata WHERE mtg_userID=\'" + obj.id + "\'");
  var gameDataObj = gameData[0].mtg_gamedata;
  var userDataObj = obj.result[0].mtg_user;
  var currentBattlefield = JSON.parse(gameDataObj.mtg_currentBattlefield);
  var unTappedCreatures = currentBattlefield["creatures"].filter(creature => !creature.isTapped);
  var creaturesToDeclare = [];

  if (obj.args[1] != null && obj.args[1].toLowerCase() == 'all')
  {
    for (i = 0; i < unTappedCreatures.length; i++)
    {
      //console.log(reactions[i]);

      var card = unTappedCreatures[i];

      var indexOfCardOnBattlefield = currentBattlefield["creatures"].indexOf(card);
      var creature = Constants.cards.filter(search => search.ID == currentBattlefield["creatures"][indexOfCardOnBattlefield].cardID)[0];
      creaturesToDeclare.push(creature.card_name);
      currentBattlefield["creatures"][indexOfCardOnBattlefield].isDeclaredAttacker = attackerState;
      currentBattlefield["creatures"][indexOfCardOnBattlefield].isDeclaredDefender = defenderState;
    }

    if (creaturesToDeclare.length > 0) {
      var declareType = attackerState ? "attackers" : "defenders";
      obj.message.reply(`You declared all of your untapped creatures as ${declareType}!\n**creatures declared:** ${creaturesToDeclare.join('|')}`);

      var updateQuery = `UPDATE mtg_gamedata SET mtg_currentBattlefield='${JSON.stringify(currentBattlefield)}' WHERE mtg_userID='${obj.id}';`;
      await HandleConnection.callDBFunction("MYSQL-returnQuery", updateQuery);
    }

    //Constants.removeIDRequest(obj.id);
    return;
  }

  if (unTappedCreatures.length < 1)
  {
    //console.log("no creatures");
    obj.message.reply("you don't have any untapped creatures you can declare as attackers or defenders!");
    //Constants.removeIDRequest(obj.id);
    return;
  }

  if (gameDataObj.mtg_currentPhase != 2)
  {
    obj.message.reply("you can only declare attackers and defenders during your combat phase! (phase 2)");
    //Constants.removeIDRequest(obj.id);
    return;
  }

  obj.message.channel.send(msg);


  var emojis = Constants.emoji_letters.slice(0, unTappedCreatures.length);
  var emojiPairs = {};

  const filter = (reaction, user) => {
    //console.log(reaction);
    return emojis.includes(reaction._emoji.name) && user.id == obj.id;
  };

  const embed = new Constants.Discord.MessageEmbed()
  //console.log(obj.result[0].mtg_startingDeck);
  .setTitle(obj.message.author.username + "\'s Creatures")
  .setColor(Constants.color_codes[obj.result[0].mtg_user.mtg_startingDeck])

  for (i = 0; i < unTappedCreatures.length; i++)
  {
      var creature = unTappedCreatures[i];

      if (creature.isTapped)
        continue;

      var isAttacking = creature.isDeclaredAttacker ? Constants.emoji_id.sword : '';
      var isDefending = creature.isDeclaredDefender ? Constants.emoji_id.shield : '';
      var card = Constants.cards.filter(search => search.ID == creature.cardID)[0];
      var legendaryStatus = card.legendary ? "- Legendary" : "";
      var power = Constants.getEquippedEnchantments("power", creature, currentBattlefield["enchantments"]);
      var strength = Constants.getEquippedEnchantments("strength", creature, currentBattlefield["enchantments"]);

      emojiPairs[emojis[i]] = creature;

      embed.addField(`creature ${legendaryStatus}`, `${emojis[i]} ${card.card_name} | ${creature.power + power}/${creature.strength + strength} ${isAttacking} ${isDefending}`, true);
  }

  var message = await obj.message.channel.send({embed});

  for (i = 0; i < emojis.length; i++)
  {
    //var emoji = Constants.client.emojis.get("name", emojis[i]);
    message.react(emojis[i]);
  }

  await message.awaitReactions(filter, { max: unTappedCreatures.length, time: Constants.reactionTimes.declareCreatures, errors: ['time'] })
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

              var indexOfCardOnBattlefield = currentBattlefield["creatures"].indexOf(card);
              var creature = Constants.cards.filter(search => search.ID == currentBattlefield["creatures"][indexOfCardOnBattlefield].cardID)[0];
              creaturesToDeclare.push(creature.card_name);
              currentBattlefield["creatures"][indexOfCardOnBattlefield].isDeclaredAttacker = attackerState;
              currentBattlefield["creatures"][indexOfCardOnBattlefield].isDeclaredDefender = defenderState;
            }
        }
        catch (err)
        {
          console.log(err);
        }
        //Constants.removeIDRequest(obj.id);
      })
      .catch(collected => {
        //obj.message.channel.send("times up");
        const reactions = collected.array();

        if (collected.size < 1)
        {
          obj.message.reply(" no creatures were selected. Declare was canceled.");
          //Constants.removeIDRequest(obj.id);
          return;
        }

        for (i = 0; i < reactions.length; i++)
        {
          //console.log(reactions[i]);

          var card = emojiPairs[reactions[i]._emoji.name];

          var indexOfCardOnBattlefield = currentBattlefield["creatures"].indexOf(card);
          var creature = Constants.cards.filter(search => search.ID == currentBattlefield["creatures"][indexOfCardOnBattlefield].cardID)[0];
          creaturesToDeclare.push(creature.card_name);
          currentBattlefield["creatures"][indexOfCardOnBattlefield].isDeclaredAttacker = attackerState;
          currentBattlefield["creatures"][indexOfCardOnBattlefield].isDeclaredDefender = defenderState;
        }

        /*console.log(`After a minute, only ${collected.size} out of 4 reacted.`);
        obj.message.channel.send( "<@" + obj.id + "> you didn\'t select a deck!");
        var indexOfRequest = beginRequests.indexOf(obj.id);
        beginRequests.splice(indexOfRequest, 1);*/
          //Constants.removeIDRequest(obj.id);
      });

      if (creaturesToDeclare.length > 0) {
        obj.message.reply(` **creatures declared:** ${creaturesToDeclare.join('|')}`);

        var updateQuery = `UPDATE mtg_gamedata SET mtg_currentBattlefield='${JSON.stringify(currentBattlefield)}' WHERE mtg_userID='${obj.id}';`;
        await HandleConnection.callDBFunction("MYSQL-returnQuery", updateQuery);
      }
}

var local = {
  declareattacker:async function(cmd, args)
  {
    var msgOwnerID = cmd.author.id;
    var channelId = cmd.channel.id;

    var obj = {
      id: msgOwnerID,
      messageObj: cmd,
      messageArgs: args,
      callback: local.afterCheckUser_attacker
    };

    Constants.SQL.emit('check-user-exists', obj)
  },

  declaredefender:async function(cmd, args)
  {
    var msgOwnerID = cmd.author.id;
    var channelId = cmd.channel.id;

    var obj = {
      id: msgOwnerID,
      messageObj: cmd,
      messageArgs: args,
      callback: local.afterCheckUser_defender
    };

    Constants.SQL.emit('check-user-exists', obj)
  },

  afterCheckUser_attacker:async function(obj)
  {
    if (obj.result.length < 1)
      return;

    if (obj.result[0].mtg_user.mtg_reset == 1) {
      obj.message.reply(" you were killed recently. You must first get a new deck with \`m!begin\` before trying to play!");
      return;
    }

    if (Constants.commandRequests.includes(obj.id))
      return Constants.MessageCodes.USER_TASK_EXISTS;


    await declareCreatures(obj, true, false, `<@${obj.id}> -> choose which creatures you want to be declared as attackers`);
  },

  afterCheckUser_defender:async function(obj)
  {
    if (obj.result.length < 1)
      return;

    if (obj.result[0].mtg_user.mtg_reset == 1) {
      obj.message.reply(", you were killed recently. You must first get a new deck before trying to play!");
      return;
    }

    if (Constants.commandRequests.includes(obj.id))
      return Constants.MessageCodes.USER_TASK_EXISTS;

    await declareCreatures(obj, false, true, `<@${obj.id}> -> choose which creatures you want to be declared as defenders`);
  }
}

module.exports = local;
HandleFunctionCall.RegisterFunction(["da", "declareattacker", "declarea", "attacker", "setattacker"], local.declareattacker);
HandleFunctionCall.RegisterFunction(["dd", "declaredefender", "declared", "defender", "setdefender"], local.declaredefender);
