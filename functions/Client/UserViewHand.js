const Constants = require('../util/Constants');
const HandleFunctionCall = require('../HandleFunctionCall');
const HandleConnection = require('../handle/HandleConnection');

var local = {
  hand:async function(cmd, args) {

    var msgOwnerID = cmd.author.id;
    var channelId = cmd.channel.id;

    var obj = {
      id: msgOwnerID,
      messageObj: cmd,
      callback: local.afterCheckUser
    };

    Constants.SQL.emit('check-user-exists', obj)
  },

  afterCheckUser:async function(obj) {

    if (obj.result.length < 1)
      return;

    Constants.pushIDRequest(obj.id);

    var res = await HandleConnection.callDBFunction("MYSQL-returnQuery", "SELECT * FROM mtg_gamedata WHERE mtg_userID=\'" + obj.id + "\'");
    //var jsonObj = res;//JSON.parse(res);
    var gameDataObj = res[0].mtg_gamedata;
    var userDataObj = obj.result[0].mtg_user;
    var currentHand = JSON.parse(gameDataObj.mtg_currentHand);
    var currentDeck = JSON.parse(gameDataObj.mtg_currentDeck);
    var currentBattlefield = JSON.parse(gameDataObj.mtg_currentBattlefield);

    const embed = new Constants.Discord.MessageEmbed()
    //console.log(obj.result[0].mtg_startingDeck);
    .setTitle(obj.message.author.username + "\'s Hand")
    .setColor(Constants.color_codes[userDataObj.mtg_startingDeck])
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
      embed.addField(card.ID.startsWith("LAND") ? "Land" : card.type.capitalize(), card.ID.startsWith("LAND") ? `(${card.ID.substring(5, card.ID.length)}) ${Constants.returnSingleManaByColor(card.colors)}${card.land}` : `(${card.ID.substring(4, card.ID.length)}) ${mana_string}${card.card_name} ${isCreatureDisplayStatsString}`, false);
    }

    obj.message.reply({embed});
  }
}

module.exports = local;
HandleFunctionCall.RegisterFunction(["h", "viewhand", "hand"], local.hand);
