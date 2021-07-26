const Constants = require('../util/Constants');
const HandleConnection = require('../handle/HandleConnection');
const HandleFunctionCall = require('../HandleFunctionCall');

function getCommandsString()
{
  var FunctionsList = HandleFunctionCall.FunctionsList;
  var keys = Object.keys(FunctionsList);
  var values = Object.values(FunctionsList);
  var commandString = "";

  for (i = 0; i < keys.length; i++)
  {
    var funcName = keys[i];
    var commandSubstrings = FunctionsList[funcName].commandStrings;
    //console.log(commandSubstrings);
    commandString += `**${funcName}** -> \`${commandSubstrings.join('|')}\`\n`;
  }

  return commandString;
}

var local = {
  help:async function(cmd, args)
  {
    Constants.pushIDRequest(cmd.author.id);

    if (args.length > 1)
    {
      if (args[1].toLowerCase() == 'commands')
      {

        var getCommandString = getCommandsString();
        const embed = new Constants.Discord.MessageEmbed()
        //console.log(obj.result[0].mtg_startingDeck);
        .setTitle(`Magic the Gathering Bot Command List`)
        .setColor(Constants.color_codes["green"])
        .setDescription(`${getCommandString}`);

        cmd.reply({embed});

        Constants.removeIDRequest(cmd.author.id);

        return;
      }
    }

    const embed = new Constants.Discord.MessageEmbed()
    //console.log(obj.result[0].mtg_startingDeck);
    .setTitle(`Magic the Gathering Help Part 1`)
    .setColor(Constants.color_codes["green"])
    .setDescription(`For a complete list of commands, type **\'m!help commands\'**.\n\n` +
    `**INTRODUCTION:**\nWelcome to Magic! If you have never played magic the gathering before, ` +
    `the premise is simple, each deck consists of ${Constants.startingCardAmount} cards. ${Constants.startingLandAmount} lands, ` +
    `${Constants.startingCardAmount - Constants.startingLandAmount} non-land cards of any creatures, instants, sorceries, or enchantments.\n\n` +
    `• Creatures are permanents that you attack and defend with.\n` +
    `• Instants and sorceries are non-permanent one-time use cards with special actions, such as draw cards, destroy target permanents, or even gain life.\n` +
    `• Enchantments are permanent cards that add special attributes to a permanent on the battlefield.\n\n`);

    /*.setDescription(`<:pack:${Constants.emoji_id.pack}>You have ${packs} pack(s) available to open.\n
    <:wildcard:${Constants.emoji_id.wildcard}>You have ${wildcards.common} common(s), ${wildcards.uncommon} uncommon(s), ${wildcards.rare} rare(s), ${wildcards.mythic} mythic rare(s) in your wildcard inventory.`)
    .setFooter(`XP Needed For Next Tier: ${parseInt(tier.maxXP - userDataObj.mtg_rankxp)} | Current Phase: ${gameDataObj.mtg_currentPhase}`)
    .addField(`${Constants.emoji_id.heart}Health`, userDataObj.mtg_health, true)
    .addField(`<:kill:${Constants.emoji_id.kill}>Kills`, userDataObj.mtg_kills, true)
    .addField(`${Constants.emoji_id.death}Deaths`, userDataObj.mtg_deaths, true)
    .addField(`<:currency:${Constants.emoji_id.currency}>Magic Beans`, userDataObj.mtg_currency, true)
    .addField(`${Constants.emoji_id.clock}Draw Cooldown`, `**\`${DrawCooldown}\`**`, true)
    .addField(`${Constants.emoji_id.clock}Attack Cooldown`, `**\`${AttackCooldown}\`**`, true)*/

    cmd.reply({embed});
    ///const embed = new Constants.Discord.MessageEmbed()
    //console.log(obj.result[0].mtg_startingDeck);
    embed.setTitle(`Magic the Gathering Help Part 2`)
    embed.setColor(Constants.color_codes["green"])
    embed.setDescription(`**PHASES:**\nEach \'turn\' consists of 3 phases, your first main phase, where you play creatures and draw your cards. Your second phase, ` +
    `also known as the combat phase, where you declare your attackers and defenders and attack with the selected creatures. ` +
    `And finally your second main phase, also known as phase 3. This is where you can use up any of your remaining mana to play any card before the turn is over. ` +
    `Each turn you will have a limited amount of mana, and that mana is obtained by playing lands. You can only cast cards with the appropiate mana type available. ` +
    `When you cast a card, you \'tap\' mana of the appropiate type and amount that the card costs, and you cannot use that mana until the next turn. \n\n` +
    `**CREATURES:**\nCreatures are deemed strong or weak based on their power and toughness. ` +
    `Power is the amount of damage that the creature deals, and toughness is the amount of damage needed to kill a creature. ` +
    `The format of determining power and toughness will always be [power] / [toughness]. ` +
    `When a creature dies, it is sent to your graveyard and cannot be retrieved. In normal magic, you would be allowed to use cards to return creatures to the field, ` +
    `however due to technical limitations this feature of magic has been disabled.\n\n` +
    `**GETTING STARTED:**\nTo get started, you must first choose a deck by typing \`m!begin\` and choose the appropiate deck color. You can view your current hand by ` +
    `typing \`m!hand\`. And you can play cards by typing \`m!playcard\` on your first main phase. Draw cards by typing \`m!draw\`.`);
    cmd.reply({embed});

    Constants.removeIDRequest(cmd.author.id);
  },

  about:function(cmd, args)
  {
    Constants.pushIDRequest(cmd.author.id);

    var BotInfo = Constants.BotInfo;

    const embed = new Constants.Discord.MessageEmbed()
    ///const embed = new Constants.Discord.MessageEmbed()
    //console.log(obj.result[0].mtg_startingDeck);
    embed.setTitle(BotInfo.name())
    embed.setColor(Constants.color_codes["green"])
    embed.setDescription(`Creator: **${BotInfo.author()}**\n` +
`Version: **${BotInfo.version()}**\n` +
`Prefix: **${BotInfo.prefix()}**\n` +
`Description: **A simple non-complex text-based version of the popular card game Magic the Gathering. This bot provides a simple and fun experience ` +
`for the casual player, whether you have or haven't played Magic the Gathering before. You can begin your journey by ` +
`typing \`m!begin\` and you can get help at any time by typing \`m!help\`.**\n` +
`Discord Server: __**https://discord.gg/mkotd**__\n` +
`Patreon: __**https://www.patreon.com/magic_kotd?fan_landing=true**__\n` +
`Website: **Coming Soon!**\n` +
`\n` +
`**NOTE:** This bot is still in the development process and some features may not work as intended or provide unexpected results. The bot will be restarted on many occasions.`);
    cmd.reply({embed});

    Constants.removeIDRequest(cmd.author.id);
  }
}

module.exports = local;
HandleFunctionCall.RegisterFunction(["help", "whatthefuckdoido"], local.help);
HandleFunctionCall.RegisterFunction(["ab", "about"], local.about);
//HandleFunctionCall.RegisterFunction(["commands", "getcommands"], local.commands);
