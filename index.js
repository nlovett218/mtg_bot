const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = 'NTUxMjI3OTE5Nzk2Nzk3NDkw.D1yuNw.m97Em7wFRMlgUPGj-gGk1mQGV70'

bot.on('message', function(message){
    if(message.content == 'Hello')
    {
        message.reply('Get Out');
    }   
});

bot.login(TOKEN);