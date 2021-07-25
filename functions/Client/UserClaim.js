const Constants = require('../util/Constants');
const HandleFunctionCall = require('../HandleFunctionCall');
const HandleConnection = require('../handle/HandleConnection');

var local = {
  claim:async function(cmd, args) {

    cmd.reply(' this command is currently not enabled.')
    /*var msgOwnerID = cmd.author.id;
    var channelId = cmd.channel.id;

    var obj = {
      id: msgOwnerID,
      messageObj: cmd,
      messageArgs: args,
      callback: local.afterCheckUser
    };

    Constants.SQL.emit('check-user-exists', obj)*/

  },

  afterCheckUser:async function(obj)
  {
  }
}


module.exports = local;
HandleFunctionCall.RegisterFunction(["cl", "claim"], local.claim);
