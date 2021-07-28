const Constants = require('../util/Constants');
const HandleConnection = require('../handle/HandleConnection');
const HandleFunctionCall = require('../HandleFunctionCall');
const NextPhase = require('./UserNextPhase');

function RegisterAdminCommands()
{
    local.matchAdminCommand["client.logout"] = local.logout;
    local.matchAdminCommand["client.reconnect"] = local.logout;
    local.matchAdminCommand["client.fix"] = local.logout;
    local.matchAdminCommand["client.reloadimages"] = local.reloadimages;
    local.matchAdminCommand["player.wipe"] = local.logout;
    local.matchAdminCommand["player.reset"] = local.logout;
    local.matchAdminCommand["player.add"] = local.logout;
    local.matchAdminCommand["player.remove"] = local.logout;
    local.matchAdminCommand["player.set"] = local.logout;
    local.matchAdminCommand["player.getname"] = local.logout;
    local.matchAdminCommand["player.resetcooldown"] = local.logout;
}

var local = {

  reloadimages:async function(cmd, args)
  {
    Constants.client.emit('refresh-images');
  },

  lockchannel:async function(cmd, args)
  {
    var msgOwnerID = cmd.author.id;
    var guildID = cmd.guild.id;

    if (Constants.guildAdmins[guildID] == undefined || (!Constants.guildAdmins[guildID].includes(msgOwnerID) && msgOwnerID != Constants.botOwnerID))
      return;

    var channels_mentioned = cmd.mentions.channels.array();

    //console.log(channels_mentioned);
    var channels = await Constants.readJSONFile(Constants.channels_data_file);

    channels_mentioned.forEach(async function(channel) {

      if (channels == null)
      {
        return;
      }

      if (channels[guildID] == undefined )
      {
        channels[guildID] = {};
        channels[guildID][channel.id] = "locked";
        //await Constants.writeJSONFile(channels);
      }
      else {
        channels[guildID][channel.id] = "locked";

      }
    });

    if (channels_mentioned.length < 1)
    {
      await cmd.reply(" no channels were mentioned!");
      return;
    }

    await Constants.writeJSONFile(Constants.channels_data_file, channels);
    await cmd.reply(" the specified channels are now __**locked!**__ I will no longer respond to commands in these channels!");
  },

  unlockchannel:async function(cmd, args)
  {
    var msgOwnerID = cmd.author.id;
    var guildID = cmd.guild.id;

    if (Constants.guildAdmins[guildID] == undefined || (!Constants.guildAdmins[guildID].includes(msgOwnerID) && msgOwnerID != Constants.botOwnerID))
      return;

    var channels_mentioned = cmd.mentions.channels.array();
    var channels = await Constants.readJSONFile(Constants.channels_data_file);

    channels_mentioned.forEach(async function(channel) {


      if (channels == null)
      {
        return;
      }

      if (channels[guildID] == undefined )
      {
        channels[guildID] = {};
        channels[guildID][channel.id] = "unlocked";

      }
      else {
        channels[guildID][channel.id] = "unlocked";
        //await Constants.writeJSONFile(channels);
      }
    });

    if (channels_mentioned.length < 1)
    {
      await cmd.reply(" no channels were mentioned!");
      return;
    }

    await Constants.writeJSONFile(Constants.channels_data_file, channels);
    await cmd.reply(" the specified channels are now __**unlocked!**__ I will now respond to commands in these channels!");
  },

  matchAdminCommand: {

  },

  processadmincommand:async function(cmd, args)
  {
    var msgOwnerID = cmd.author.id;

    if (!Constants.botAdmins.includes(msgOwnerID))
      return;

    //Constants.pushIDRequest(obj.id);

    if (local.matchAdminCommand[args[1]] != undefined)
      local.matchAdminCommand[args[1]](cmd, args);
  },

  logout:async function(cmd, args)
  {
    //console.log(cmd);
    //console.log(args);
    var message = await cmd.reply(" goodbye world!");
    await Constants.client.destroy();
    process.exit(0);
  }
}

module.exports = local;
HandleFunctionCall.RegisterFunction(["process", "admin", "command", "ac"], local.processadmincommand);
HandleFunctionCall.RegisterFunction(["lock"], local.lockchannel);
HandleFunctionCall.RegisterFunction(["unlock"], local.unlockchannel);
RegisterAdminCommands();
