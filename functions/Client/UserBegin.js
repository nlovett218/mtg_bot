const Constants = require('../util/Constants');
const HandleFunctionCall = require('../HandleFunctionCall');
const HandleConnection = require('../handle/HandleConnection');

function isAcceptableCard(land, cardColor)
{
  var colorTable = JSON.parse(land.colors).colors;

  var colors = Object.keys(colorTable);

  return colors.includes(cardColor);
}

function addUpStartingCards(listLands, listCards, cardType)
{
    var cards = [

    ]

    var cardsOfType = [

    ];

    for(i = 0; i < listCards.length; i++)
    {
      //console.log(listCards[i].ID);
      var mana_cost = JSON.parse(listCards[i].mana_cost);
      if (mana_cost[cardType] > 0)
        cardsOfType.push(listCards[i]);
    }

    try {
      var land = listLands.filter(land => (land.type.includes('land') || land.type.includes('basic land')) && isAcceptableCard(land, cardType));
    }
    catch (err)
    {
      throw err;
    }

    if (land == null)
    {
      console.log("index null");
      return null;
    }

    for (x = 0; x < Constants.startingLandAmount; x++)
    {
        if (x > 19)
          cards.push(land[Math.floor(Math.random()*land.length)]); //chance to get 4 multicolor lands
        else
          cards.push(listLands.filter(land => land.type.includes('basic land') && isAcceptableCard(land, cardType))[0]) //ensures we dont get too many multicolor lands
    }

    for (y = 0; y < (Constants.startingCardAmount - Constants.startingLandAmount); y++)
    {
        var randomCard = cardsOfType[Math.floor(Math.random()*cardsOfType.length)];

        var randomCardAmount = cards.filter(card => card.ID == randomCard.ID);

        if (randomCardAmount.length < 4)
          cards.push(randomCard);
        else
          cards.push(land);
    }

    return cards;
}

async function displayStartingDeck(cmd, cards)
{
  var msgOwnerID = cmd.author.id;
  var channelId = cmd.channel.id;

  //var cards = arrayCards;
  var cardsAlreadyFiltered = [];
  var filteredCards = [];
  var color = "";

  //console.log("display deck running");

    for (i = 0; i < cards.length; i++) {
      var card = cards[i];

      if (cardsAlreadyFiltered.indexOf(card) < 0) {
        if (card.ID.startsWith("LAND"))
          color = card.colors;
        //console.log("card not found");
        var cardMatches = cards.filter(f => f.ID == card.ID);
        cardsAlreadyFiltered.push(card);
        filteredCards.push(cardMatches);
      }
      else {
        //console.log("index is greater than -1")
      }
    }

    const embed = new Constants.Discord.MessageEmbed()
    .setTitle(cmd.author.username + "\'s Starting Deck")
    .setColor(Constants.color_codes[color])
    .setDescription("Total Number of Cards: " + cards.length);

    /*.setImage("https://i.imgur.com/XxblI2S.jpg")*/
    for(x = 0; x < filteredCards.length; x++)
    {
      var card = filteredCards[x][0];
      var amount = filteredCards[x].length;
      var mana_string = "";

      if (card.ID.startsWith("LAND"))
      {

      }
      else if (card.ID.startsWith("MTG")) {
        var mana_cost = JSON.parse(card.mana_cost);
        mana_string = Constants.getManaString(mana_cost);
      }

      //console.log(card);

      embed.addField(card.ID.startsWith("LAND") ? "Land" : card.type.capitalize(), card.ID.startsWith("LAND") ? amount + "x " + card.type + " " + Constants.returnManaByColorTable(card.colors) : amount + "x " + mana_string + card.card_name, false);
    }

    cmd.channel.send({embed});

}

var local = {
  begin:async function(cmd, args)
  {
    var msgOwnerID = cmd.author.id;
    var channelId = cmd.channel.id;

    var obj = {
      id: msgOwnerID,
      messageObj: cmd,
      callback: local.afterCheckUser
    };

    Constants.SQL.emit('check-user-exists', obj)
    //data is returned as an array of dictionaries
    //[ { 'mtg_user' <---- table name
    //    { } <---- results
    // } ]
    //console.log(obj);

  },

  afterCheckUser:async function(obj)
  {
    var message = null;

    if (obj.error)
    {
      obj.message.channel.send(obj.error);
      return;
    }



    if (Constants.commandRequests.includes(obj.id))
      return Constants.MessageCodes.USER_TASK_EXISTS;

    Constants.pushIDRequest(obj.id);

    if (obj.result.length < 1)
    {


      message = await obj.message.channel.send(`<@${obj.id}> Welcome to Magic! If you have never played magic the gathering, then we'll keep it simple for you. Choose your starting deck.\n•White decks are about having board control with using token and non-token creatures.\n•Black decks are about removal and returning creatures to the field.\n•Green decks are about power and strength.\n•Red decks are about early game aggression for quick wins.\n•Blue decks are about control with countering and card draw.`);

      /*const white = message.guild.emojis.find('name', 'white');
      const black = message.guild.emojis.find('name', 'black');
      const green = message.guild.emojis.find('name', 'green');
      const red = message.guild.emojis.find('name', 'red');
      const blue = message.guild.emojis.find('name', 'blue');
      console.log(white.id);
      console.log(black.id);
      console.log(green.id);
      console.log(red.id);
      console.log(blue.id);*/
    }
    else {
      if (obj.result[0].mtg_user.mtg_reset == 0) {
        //console.log(obj);
        message = await obj.message.reply(Constants.MessageCodes.USER_exists);
        return;
      }
      else {
        message = await obj.message.channel.send(`<@${obj.id}> Tough luck. Maybe this time you'll survive longer. Choose a new deck.`);
      }
    }

    //Constants.pushIDRequest(obj.id);
    message.react(Constants.emoji_id.white);
    message.react(Constants.emoji_id.black);
    message.react(Constants.emoji_id.green);
    message.react(Constants.emoji_id.red);
    message.react(Constants.emoji_id.blue);

    const filter = (reaction, user) => {
    	return [Constants.emoji_id.white, Constants.emoji_id.black, Constants.emoji_id.green, Constants.emoji_id.red, Constants.emoji_id.blue].includes(reaction.emoji.id) && user.id == obj.id;
    };

    message.awaitReactions(filter, { max: 1, time: Constants.reactionTimes.begin, errors: ['time', 'duplicate'] })
      	.then(async collected => {
      		const reaction = collected.first();

          //var listCards = await HandleConnection.callDBFunction("ADODB-returnQuery", "SELECT * FROM cards");
          //var listLands = await HandleConnection.callDBFunction("ADODB-returnQuery", "SELECT * FROM lands WHERE type=\'basic\'");
          //if (listCards.length < 1)
            //return;

          //console.log(listCards[0]);
          var startingDeck = null;
          var color = null;

          try {
            switch (reaction.emoji.id) {
              case Constants.emoji_id.white:
                //message.reply('You reacted with the white deck!');
                color = "white";
                startingDeck = addUpStartingCards(Constants.lands, Constants.cards, "white");
                break;
              case Constants.emoji_id.black:
                //message.reply('You reacted with the black deck!');
                color = "black";
                startingDeck = addUpStartingCards(Constants.lands, Constants.cards, "black");
                break;
              case Constants.emoji_id.green:
                //message.reply('You reacted with the green deck!');
                color = "green";
                startingDeck = addUpStartingCards(Constants.lands, Constants.cards, "green");
                break;
              case Constants.emoji_id.red:
                //message.reply('You reacted with the red deck!');
                color = "red";
                startingDeck = addUpStartingCards(Constants.lands, Constants.cards, "red");
                break;
              case Constants.emoji_id.blue:
                //message.reply('You reacted with the blue deck!');
                color = "blue";
                startingDeck = addUpStartingCards(Constants.lands, Constants.cards, "blue");
                break;
              default:
            }

            await displayStartingDeck(obj.message, startingDeck);

            var shuffledList = Constants.shuffle(startingDeck);
            var data = {
              ownerID: obj.id,
              cards: shuffledList,
              color: color,
              mtg_user: obj.result[0] == null ? null : obj.result[0].mtg_user
            };
            if (obj.result[0] == null)
              Constants.SQL.emit('client-begin-upload', data);
            else
              Constants.SQL.emit('client-reset-update', data);
          }
          catch (err) { console.log(err);}
          finally {
            obj.message.channel.send( "<@" + obj.id + ">, " + reaction.emoji.name + " deck, good choice!");
            //Constants.removeIDRequest(obj.id);
            //Constants.commandRequests.splice(indexOfRequest, 1);
          }
      	})
      	.catch(collected => {
      		console.log(`After a minute, only ${collected.size} out of 4 reacted.`);
      		obj.message.channel.send( "<@" + obj.id + "> you didn\'t select a deck!");
          //Constants.removeIDRequest(obj.id);
          //Constants.commandRequests.splice(indexOfRequest, 1);
      	});


  }

};

module.exports = local;
HandleFunctionCall.RegisterFunction(["b", "begin"], local.begin);
