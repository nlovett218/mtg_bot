const Constants = require('../util/Constants');
const HandleFunctionCall = require('../HandleFunctionCall');
const HandleConnection = require('../handle/HandleConnection');

var local = {
  draw:async function(cmd, args) {

    var msgOwnerID = cmd.author.id;
    var channelId = cmd.channel.id;

    var obj = {
      id: msgOwnerID,
      messageObj: cmd,
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

      Constants.pushIDRequest(obj.id);

      //var userData = await HandleConnection.callDBFunction("MYSQL-returnQuery", "SELECT * FROM mtg_gamedata WHERE mtg_userID=\'" + obj.id + "\'");
      var gameData = await HandleConnection.callDBFunction("MYSQL-returnQuery", "SELECT * FROM mtg_gamedata WHERE mtg_userID=\'" + obj.id + "\'");
      //var jsonObj = res;//JSON.parse(res);
      var gameDataObj = gameData[0].mtg_gamedata;
      var userDataObj = obj.result[0].mtg_user;
      var currentHand = JSON.parse(gameDataObj.mtg_currentHand);
      var currentDeck = JSON.parse(gameDataObj.mtg_currentDeck);
      var guildID = obj.message.guild.id;
      var guilds = JSON.parse(userDataObj.mtg_guilds);
      var guildObjID = `${Constants.guildPrefix}${guildID}`;

      if (currentDeck.deck.length < 1)
      {
        await HandleConnection.callDBFunction("MYSQL-returnQuery", "UPDATE mtg_user SET mtg_reset='1', mtg_health='-1' WHERE mtg_userID=\'" + obj.id + "\'");
        obj.message.reply(" you ran out of cards!");
        return;
      }

      if (guilds[guildObjID] == undefined || guilds[guildObjID].optedInToServer == 0) {
        obj.message.reply(" you must first opt in before you can draw cards!");
        return;
      }

      if (gameDataObj.mtg_currentPhase < 2)
      {
        if (gameDataObj.mtg_allowedCardDraw > 0)
        {
          //var newCardDrawAmount = gameDataObj.mtg_allowedCardDraw--;
          //console.log(new Date(userDataObj.mtg_lastCardDrawnDateTime).toISOString());
          var mtg_lastCardDrawnTime = new Date(userDataObj.mtg_lastCardDrawnDateTime);
          var timeSinceLastDraw = new Date(mtg_lastCardDrawnTime);
          var timeToAllowDraw = Date.parse(new Date(Constants.moment(timeSinceLastDraw).add(Constants.drawCooldown, 'minutes').format(Constants.momentTimeFormat)));//new Date(Constants.moment(timeSinceLastDraw).add(10, 'minutes').format("YYYY-MM-DD h:mm:ss"));
          var now = Date.now();

          if (timeToAllowDraw <= now)
          {
            //console.log("draw card allowed");
            //console.log(timeSinceLastDraw);
            //console.log(now);
            var newCards = currentDeck.deck.splice(0, parseInt(gameDataObj.mtg_allowedCardDraw));
            newCards.forEach(async function(newCard)
            {
              currentHand.hand.push(newCard);
              await Constants.displayNewCard(obj, newCard);
            });

            //var now = Constants.moment().format();
            var query = `UPDATE mtg_gamedata SET mtg_currentHand='${JSON.stringify(currentHand)}', mtg_currentDeck='${JSON.stringify(currentDeck)}', mtg_currentPhase='1', mtg_allowedCardDraw='0' WHERE mtg_userID='${obj.id}';`;
            var query2 = `UPDATE mtg_user SET mtg_lastCardDrawnDateTime=STR_TO_DATE('${Constants.moment(now).format(Constants.momentTimeFormat)}', '%m-%d-%Y %H:%i:%s') WHERE mtg_userID='${obj.id}';`
            await HandleConnection.callDBFunction("MYSQL-fireAndForget", query);
            await HandleConnection.callDBFunction("MYSQL-fireAndForget", query2);

            await Constants.triggerEvent(obj.id, obj.id, null, "onCardDraw", null, null, null, obj);
          }
          else {
            var timeDifference = Constants.getTimeBetween(timeToAllowDraw, now);
            var timeString = `${parseInt(timeDifference.hours.toFixed()).pad()}:${parseInt(timeDifference.minutes.toFixed()).pad()}:${parseInt(timeDifference.seconds.toFixed()).pad()}`;
            obj.message.reply(`you still have \`${timeString}\` until you can draw another card!`);
          }
        }
        else {
          obj.message.reply("you have already drawn your cards this phase!");
        }
      }
      else {
        obj.message.reply("you can only draw on your first main phase!");
      }
  }
};

module.exports = local;
HandleFunctionCall.RegisterFunction(["d", "draw", "drawcard"], local.draw);
