// sword and shield unicode emoji ⚔ 🛡
const Constants = require('../util/Constants');
const HandleConnection = require('../handle/HandleConnection');
const HandleFunctionCall = require('../HandleFunctionCall');

var local = {
  viewbattlefield:async function(cmd, args)
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

    Constants.pushIDRequest(obj.id);

    var gameData = null;
    var authorID = obj.args[1] == null ? obj.id : obj.args[1];

    if (obj.args[1] != null) {
      if (obj.args[1].includes('<', '@', '>' ))
      {
        if (authorID.includes('!'))
          authorID = obj.args[1].slice(3); //remove the <@! characters before the ID
        else
          authorID = obj.args[1].slice(2);
        authorID = authorID.substring(0, authorID.length - 1);
      }
      else if (obj.args[1].includes('@'))
      {
        authorID = authorID.slice(1);
      }

      if (!authorID.includes("\'", "\""))
        gameData = await HandleConnection.callDBFunction("MYSQL-returnQuery", "SELECT * FROM mtg_gamedata WHERE mtg_userID=\'" + authorID + "\'");

      if (gameData == null || gameData.length < 1)
      {
        obj.message.channel.send(`<@${obj.id}> -> No user data was found for '${obj.args[1]}'!`);
        return;
      }
    }
    else {
      gameData = await HandleConnection.callDBFunction("MYSQL-returnQuery", "SELECT * FROM mtg_gamedata WHERE mtg_userID=\'" + obj.id + "\'");
    }

    var gameDataObj = gameData[0].mtg_gamedata;
    var userDataObj = obj.result;
    if (authorID != obj.id)
      userDataObj = await HandleConnection.callDBFunction("MYSQL-returnQuery", "SELECT * FROM mtg_user WHERE mtg_userID=\'" + authorID + "\'");
    var currentBattlefield = JSON.parse(gameDataObj.mtg_currentBattlefield);

    if (userDataObj.length < 1)
      return;

    var memberName = authorID;
    var member = null;

    try {
      member = await obj.message.guild.members.fetch(authorID);

      memberName = member.user.username;

      //console.log(memberName.user));
      //console.log(memberName);
    }
    catch (err)
    {
      console.log(err);
    }

    if (member == null && memberName != obj.id)
    {
      //obj.message.channel.send(`<@${obj.id}> -> No user data was found for '${obj.args[1]}'!`);
      //return;
      memberName = `<@${authorID}>`;
    }

    const embed = new Constants.Discord.MessageEmbed()
    //console.log(obj.result[0].mtg_startingDeck);
    .setTitle(`${memberName}\'s Battlefield`)
    .setColor(Constants.color_codes[userDataObj[0].mtg_user.mtg_startingDeck])
    .addField("Available Mana", Constants.getAvailableMana(currentBattlefield), false)
    .addField("Health", userDataObj[0].mtg_user.mtg_health, true)
    //.addField("Total Po)

    var cardsAlreadyFiltered = [];
    var filteredCards = [];

    //var battlefield = currentBattlefield["creatures"];


    for (i = 0; i < currentBattlefield["creatures"].length; i++)
    {
      var creature = currentBattlefield["creatures"][i];
      //console.log(creature);
      if (!cardsAlreadyFiltered.includes(creature.fieldID))
      {
        var power = Constants.getEquippedEnchantments("power", creature, currentBattlefield["enchantments"]);
        var strength = Constants.getEquippedEnchantments("strength", creature, currentBattlefield["enchantments"]);

          //console.log("card not found");
        //console.log(creature);

        var cardMatches = currentBattlefield["creatures"].filter(f => f.cardID == creature.cardID && f.power + Constants.getEquippedEnchantments("power", f, currentBattlefield["enchantments"]) == creature.power + power && f.strength + Constants.getEquippedEnchantments("strength", f, currentBattlefield["enchantments"]) == creature.strength + strength && f.isDeclaredDefender == creature.isDeclaredDefender && f.isDeclaredAttacker == creature.isDeclaredAttacker && f.isTapped == creature.isTapped);
        //var cardMatches = currentBattlefield["creatures"].filter(f => f.cardID == creature.cardID && f.power == creature.power && f.strength == creature.strength && f.isDeclaredDefender == creature.isDeclaredDefender && f.isDeclaredAttacker == creature.isDeclaredAttacker && f.isTapped == creature.isTapped);
        //console.log(currentBattlefield);
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
      var isTapped = card.isTapped ? `<:tapped:${Constants.emoji_id.tapped}> *(tapped)*` : ``;
      var power = Constants.getEquippedEnchantments("power", card, currentBattlefield["enchantments"]);
      var strength = Constants.getEquippedEnchantments("strength", card, currentBattlefield["enchantments"]);
      var isCreatureDisplayStatsString = cardFromLibrary.type == 'creature' ? `${card.power + power}/${card.strength + strength} ${isAttacking}${isDefending}` : ``;
      embed.addField('Creature', `${isTapped} ${amount}x ${cardFromLibrary.card_name} ${isCreatureDisplayStatsString}`, false);
    }

    obj.message.reply({embed});
  }
};

module.exports = local;
HandleFunctionCall.RegisterFunction(["vb", "view", "battlefield", "viewb"], local.viewbattlefield);
