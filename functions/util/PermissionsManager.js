const Constants = require('./Constants');
const { Permissions } = require('discord.js');

var local = {
  permissionsFlags:new Permissions([
    'SEND_MESSAGES',
    'EMBED_LINKS',
    'ATTACH_FILES',
    'ADD_REACTIONS',
    'VIEW_CHANNEL',
    'USE_EXTERNAL_EMOJIS',
    'READ_MESSAGE_HISTORY',
  ]),

  checkPermissions:function(obj)
  {
    //console.log(local.permissionsFlags);
    /*if (!Constants.permissionsFlags.has('SEND_MESSAGES'))
      return false;
    if (!Constants.permissionsFlags.has('EMBED_LINKS'))
      return false;
    if (!Constants.permissionsFlags.has('ATTACH_FILES'))
      return false;
    if (!Constants.permissionsFlags.has('ADD_REACTIONS'))
      return false;
    if (!Constants.permissionsFlags.has('VIEW_CHANNEL'))
      return false;
    if (!Constants.permissionsFlags.has('USE_EXTERNAL_EMOJIS'))
      return false;
    if (!Constants.permissionsFlags.has('READ_MESSAGE_HISTORY'))
      return false;*/

    return true;
  },

  checkPermissionsForChannel:function(channelObj, clientMember)
  {
    //console.log(local.permissionsFlags);
    try {
      if (channelObj.permissionsFor(clientMember).has(local.permissionsFlags, false) == false)
      //if (member.hasPermission(local))
        //console.log(permissions);
        return false;
    }
    catch (err)
    {
      console.log(err);
      return false;
    }

    return true;
  }
}

module.exports = local;
