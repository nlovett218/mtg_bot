const Constants = require('../util/Constants');
const HandleFunctionCall = require('../HandleFunctionCall');
const HandleConnection = require('../handle/HandleConnection');

var local = {
  redeemwildcard:async function(cmd, args) {
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

    var authorID = obj.id;
    var userDataObj = obj.result[0].mtg_user;
    var args = obj.args;

    if (userDataObj.mtg_reset == 1) {
      obj.message.reply(" you were killed recently. You must first get a new deck with \`m!begin\` before trying to redeem wildcards!");
      return;
    }

    if (Constants.commandRequests.includes(obj.id))
      return Constants.MessageCodes.USER_TASK_EXISTS;

    Constants.pushIDRequest(obj.id);
    //var gameData = null;


    if (obj.args == null || obj.args.length > 1)
    {
      try {
        //var cardID_arg = args[1];
        var cardAmount_arg = 1;

        if (args[1] != null)
          cardAmount_arg = parseInt(args[1]);

        var search = null;
        if (Constants.isNumber(cardAmount_arg))
        {
          cardAmount_arg = 1;
          search = Constants.returnClosestMatchToCard(obj.args.slice(1));
        }
        else {
          search = Constants.returnClosestMatchToCard(obj.args.slice(2));
        }

        if (search == null)
        {
          //Constants.removeIDRequest(obj.id);
          await obj.message.reply(` no card found with \'${obj.args.slice(2).join(' ')}\'!`)
          return;
        }

        if (search.cardID.startsWith("LAND"))
        {
          //Constants.removeIDRequest(obj.id);
          await obj.message.reply(` you can't redeem wildcards for lands!`);
          return;
        }

        //var cardFromLibrary = cards[0];

        var wildcards = JSON.parse(userDataObj.mtg_wildcards);

        if (wildcards[search.cardObj.rarity] < cardAmount_arg)
        {
          //Constants.removeIDRequest(obj.id);
          await obj.message.reply(` you don't have enough wildcards in your inventory to redeem ${cardAmount_arg} of ${search.cardObj.card_name}!`);
          return;
        }

        const filter = (reaction, user) => {
          //console.log(reaction);
          return [Constants.emoji_id.yes_mark, Constants.emoji_id.no_mark].includes(reaction._emoji.name) && user.id == obj.id;
        };

        var message = await obj.message.channel.send(`<@${obj.id}> -> Are you sure you want to redeem ${cardAmount_arg}x __**${search.cardObj.rarity.capitalize()}**__ wildcard(s) for \'${search.cardObj.card_name}\'?`);

        message.react(Constants.emoji_id.yes_mark);
        message.react(Constants.emoji_id.no_mark);

        var canceled = false;
        var redeem = null;
        var gameData = null;

        await message.awaitReactions(filter, { max: 1, time: Constants.reactionTimes.redeemWildcard, errors: ['time'] })
            .then(async collected => {
                const reactions = collected.array();

              redeem = reactions[0]._emoji.name == Constants.emoji_id.yes_mark ? true : null;

              if (redeem == null)
              {
                message.edit(`<@${obj.id}> -> redeem canceled.`);
                //Constants.removeIDRequest(obj.id);
                return;
              }

              if (redeem)
              {
                message.edit(`<@${obj.id}> -> You successfully redeemed the wildcards!`);
                gameData = await HandleConnection.callDBFunction(`MYSQL-returnQuery`, `SELECT * FROM mtg_gamedata WHERE mtg_userID=\'${obj.id}\'`);
              }
              else
              {
                canceled = true;
                message.edit(`<@${obj.id}> -> redeem canceled.`);
              }

              //Constants.removeIDRequest(obj.id);
            })
            .catch(collected => {
                canceled = true;
                message.edit(`<@${obj.id}> -> redeem canceled.`);
                //Constants.removeIDRequest(obj.id);
            });

        if (canceled || (gameData == null || gameData[0] == null))
        {
          //Constants.removeIDRequest(obj.id);
          return;
        }

        var gameDataObj = gameData[0].mtg_gamedata;
        var currentDeck = JSON.parse(gameDataObj.mtg_currentDeck);

        var newWildCardAmount = wildcards[search.cardObj.rarity] - cardAmount_arg;
        wildcards[search.cardObj.rarity] = newWildCardAmount;

        for(i =0; i < cardAmount_arg; i++)
        {
          currentDeck.deck.push(search.cardID);
        }

        currentDeck.deck = await Constants.shuffle(currentDeck.deck);

        var updateGameDataQuery = `UPDATE mtg_gamedata SET mtg_currentDeck='${JSON.stringify(currentDeck)}' WHERE mtg_userID='${obj.id}';`;
        var updateUserDataQuery = `UPDATE mtg_user SET mtg_wildcards='${JSON.stringify(wildcards)}' WHERE mtg_userID='${obj.id}'`;

        await HandleConnection.callDBFunction('MYSQL-fireAndForget', updateUserDataQuery);
        await HandleConnection.callDBFunction('MYSQL-fireAndForget', updateGameDataQuery);

      }
      catch (err)
      {
        //Constants.removeIDRequest(obj.id);
        console.log(err);
      }
    }
    else {
      //Constants.removeIDRequest(obj.id);
      await obj.message.channel.send(`<@${obj.id}> -> \`m!redeem [AMOUNT] [CARD ID OR NAME]\``);
      return;
    }
  }
};

module.exports = local;
HandleFunctionCall.RegisterFunction(["wc", "wildcard", "wildc", "r", "redeem"], local.redeemwildcard);
