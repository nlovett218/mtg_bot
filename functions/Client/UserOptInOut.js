const Constants = require('../util/Constants');
const HandleConnection = require('../handle/HandleConnection');
const HandleFunctionCall = require('../HandleFunctionCall');

async function confirmOptInOut(obj)
{
  Constants.pushIDRequest(obj.id);

  var userDataObj = obj.result[0].mtg_user;
  var guildID = obj.message.guild.id;

  const filter = (reaction, user) => {
    //console.log(reaction);
    return [Constants.emoji_id.yes_mark, Constants.emoji_id.no_mark].includes(reaction._emoji.name) && user.id == obj.id;
  };

  var optInOut = 0;

  var message = await obj.message.channel.send(`<@${obj.id}> -> ${obj.param[1]}`);

  message.react(Constants.emoji_id.yes_mark);
  message.react(Constants.emoji_id.no_mark);

  var canceled = false;

  await message.awaitReactions(filter, { max: 1, time: Constants.reactionTimes.optInOut, errors: ['time'] })
      .then(collected => {
          const reactions = collected.array();

        optInOut = reactions[0]._emoji.name == Constants.emoji_id.yes_mark ? obj.param[0] : null;

        if (optInOut == null)
        {
          canceled = true;
          message.edit(`<@${obj.id}> -> ${obj.param[0]} canceled.`);
          //Constants.removeIDRequest(obj.id);
          return;
        }

        if (optInOut == "optin")
          message.edit(`<@${obj.id}> -> You are now opted in to the server!`);
        else
          message.edit(`<@${obj.id}> -> You are now opted out of the server!`);

        //Constants.removeIDRequest(obj.id);
      })
      .catch(collected => {
          canceled = true;
          message.edit(`<@${obj.id}> -> ${obj.param[0]} canceled.`);
          //Constants.removeIDRequest(obj.id);
      });

      if (canceled)
        return;

      var guilds = JSON.parse(userDataObj.mtg_guilds);
      var guildObjID = `${Constants.guildPrefix}${guildID}`;
      guilds[guildObjID] = {};
      guilds[guildObjID].optedInToServer = optInOut == "optin" ? 1 : 0;
      var updateQuery = `UPDATE mtg_user SET mtg_guilds='${JSON.stringify(guilds)}' WHERE mtg_userID='${obj.id}';`;
      await HandleConnection.callDBFunction("MYSQL-returnQuery", updateQuery);
}

var local = {

  optin:async function(cmd, args){
    var msgOwnerID = cmd.author.id;
    var channelId = cmd.channel.id;

    var obj = {
      id: msgOwnerID,
      messageObj: cmd,
      messageArgs: args,
      callback: local.afterCheckUser_optin,
      optional_param: ["optin", "Do you wish to opt in to the server? This means you __**can**__ be attacked by other players."]
    };

    Constants.SQL.emit('check-user-exists', obj)
  },

  optout:async function(cmd, args){
    var msgOwnerID = cmd.author.id;
    var channelId = cmd.channel.id;

    var obj = {
      id: msgOwnerID,
      messageObj: cmd,
      messageArgs: args,
      callback: local.afterCheckUser_optout,
      optional_param: ["optout", "Do you wish to opt out of the server? This means you __**can't**__ be attacked by other players."]
    };

    Constants.SQL.emit('check-user-exists', obj)
  },

  afterCheckUser_optin:async function(obj) {
    if (obj.result.length < 1)
      return;

    if (Constants.commandRequests.includes(obj.id))
      return Constants.MessageCodes.USER_TASK_EXISTS;

    await confirmOptInOut(obj);
  },

  afterCheckUser_optout:async function(obj) {
    if (obj.result.length < 1)
      return;

    if (Constants.commandRequests.includes(obj.id))
      return Constants.MessageCodes.USER_TASK_EXISTS;

    await confirmOptInOut(obj);
  }
};

module.exports = local;
HandleFunctionCall.RegisterFunction(["oi", "optin"], local.optin);
HandleFunctionCall.RegisterFunction(["ou", "optout"], local.optout);
