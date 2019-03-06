const Discord = require('discord.js');
const Client = new Discord.Client();
const config = require('./config.json');
const Commando = require('discord.js-commando');
const fileUrl = require('file-url');


Client.on('ready', () => {
    console.log('Bot is now connected');

    Client.channels.find(x => x.name === 'ragebot-testing').send('Rage\'s bot is online.');
});

Client.on('message', function(message){

    if (message.content === '!draw' ){

      const embed = new Discord.RichEmbed()
      .attachFiles(['img1.png'])
      .setImage('attachment://img1.png')
       message.channel.send(embed)

    }
 });

      Client.on('message', message => {
        // Voice only works in guilds, if the message does not come from a guild,
        // we ignore it
        if (!message.guild) return;

        if (message.content === '!join') {
          // Only try to join the sender's voice channel if they are in one themselves
          if (message.member.voiceChannel) {
            message.member.voiceChannel.join()
              .then(connection => { // Connection is an instance of VoiceConnection
                message.reply('Trump is in the house!');
              })
              .catch(console.log);
          } else {
            message.reply('You need to join a voice channel first!');
          }
        }
 });


Client.on('message', function(message){
    if(message.content == 'Hello')
    {
        message.reply('Get Out');
    }
});

Client.login(config.token);
