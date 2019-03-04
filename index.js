const Discord = require('discord.js');
const Client = new Discord.Client();
const config = require('./config.json');


Client.on('ready', () => {
    console.log('Bot is now connected');

    Client.channels.find(x => x.name === 'ragebot-testing').send('Rage\'s bot is online.');
});


Client.on('message', function(message){
    if(message.content == 'Hello')
    {
        message.reply('Get Out');
    }
});

Client.login(config.token);
