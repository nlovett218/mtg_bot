const Constants = require('../util/Constants');
const HandleConnection = require('../handle/HandleConnection');
const HandleFunctionCall = require('../HandleFunctionCall');
const util = require('util');
//const { AbortController } = require('node-abort-controller');
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
var notifications = [];

const http = require("http");

/*async function createAdNetRequest(url, userId, apiKey) {
  if (apiKey == null)
        apiKey="cae80bbf14e2bfec658ca5dd9594f1b3cc177898"
        
  //if (userId == null)
        //userId="25698197"

  //const APIURL = "http://api.adf.ly/v1/shorten"
  const APIURL = `https://clicksfly.com/api?api=${apiKey}&url=${url}&alias=${userId}`;



  const params = new URLSearchParams();
  params.append('api', apiKey);
  params.append('alias', userId);
  params.append('url', url);
  
  //const data = `_user_id=${userId}&_api_key=${apiKey}&url=${url}`

  var short_url = null;

  var short = await fetch(`${APIURL}`)
  .then(res => res.json())
  .then(json => {
    console.log(json);
    short_url = json.shortenedUrl;
  });

  return short_url;
}*/

function alreadyHasCooldownRequest(id)
{
  var request = notifications.filter(n => n.id == id);

  if (request.length > 0)
    return true;

  return false;
}

function userHasTimer(id)
{
  var pass = false;
  for(i = 0; i < timers.length; i++)
  {
    if (timers[i].ownerID == id)
      pass = true;
  }

  return pass;
}

function processTimerFinishEvent(notification, cooldown)
{
  //console.log("timer finished");

  //console.log(cooldown);
  sendDirectMessage(notification.id, Constants.cooldownString, [cooldown]);

  /*if (cooldown)

  notification[cooldown].timer = setTimeout(() => {
    processTimerFinishEvent(notification, cooldown);
  }, newTime);*/
}

async function sendDirectMessage(userId, msg, msgFormatIdentifiers)
{
  const user = await Constants.client.users.fetch(userId).catch(() => null);

  if (!user) return;

  var msgFormatted = msg;

  //console.log(msgFormatIdentifiers);

  if (msgFormatIdentifiers != null) {
    //console.log("replacing string");
    //var inputCardString = ``;
    for (i = 0; i < msgFormatIdentifiers.length; i++)
    {
      //inputCardString += `${msgFormatIdentifiers[i]}`;
      //console.log(`[${i}]`);
      //console.log(`${msgFormatIdentifiers[i]}`);
      msgFormatted = String(msgFormatted).replace(`[${i}]`, `${msgFormatIdentifiers[i]}`);
    }

    //console.log(`[${i}]`);
    
  }

  await user.send(msgFormatted).catch(() => {
     return console.log(`Attempt to send direct message to ${userId} but user has DMs closed or has no mutual servers with the bot`);
  });
}

function getTimerTime(time)
{
  if (time == -1)
    return -1;

  var days = time.days * 24 * 60 * 60 * 1000;
  var hours = time.hours * 60 * 60 * 1000;
  var minutes = time.minutes * 60 * 1000;
  var seconds = time.seconds * 1000;

  return days + hours + minutes + seconds;
}

Constants.NOTIFICATIONS.on('start-timer', async timerObj => {
  var request = notifications.filter(n => n.id == timerObj.id)[0];

  if (timerObj.time > 0) {
    request[timerObj.cooldown].timer = setTimeout(() => {
      processTimerFinishEvent(request, timerObj.cooldown);
    }, timerObj.time);
  }
});

var local = {
  notify:async function(cmd, args) {

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
        obj.message.reply(" you were killed recently. You must first get a new deck with \`m!begin\`!");
        return;
      }

      if (alreadyHasCooldownRequest(obj.id)) {
        console.log("user has request");

        notifications.forEach((request) => {
          if (request.id == obj.id) {

            clearTimeout(request.draw.timer);
            clearTimeout(request.attack.timer);
            //clearTimeout(request.claim.timer);
            clearTimeout(request.daily.timer);
            clearTimeout(request.weekly.timer);
          }
        });

        var requests = notifications.filter(n => n.id != obj.id);

        //var n = notifications.splice(notifications.indexOf(request), 1);
        notifications = requests;
      }

      var userData = obj.result;
      var userDataObj = userData[0].mtg_user;
      var now = Date.now();

      var AttackCooldownTime = -1;
      var DrawCooldownTime = -1;
      var ClaimCooldownTime = -1;
      var DailyCooldownTime = -1;
      var WeeklyCooldownTime = -1;

      //console.log(notifications);

      //var APICall = await createAdFlyRequest("https://top.gg/bot/809222643898646618", obj.id);
      //console.log(APICall);

      if (userDataObj.mtg_lastAttackDateTime != null && userDataObj.mtg_lastAttackDateTime != undefined) {
        var mtg_lastAttackDateTime = new Date(userDataObj.mtg_lastAttackDateTime);
        var timeToAllowAttack = Date.parse(new Date(Constants.moment(mtg_lastAttackDateTime).add(Constants.attackCooldown, 'minutes').format(Constants.momentTimeFormat)));
        var attackTimeDifference = Constants.getTimeBetween(timeToAllowAttack, now);
        //var timeString = `${parseInt(attackTimeDifference.hours.toFixed()).pad()}:${parseInt(attackTimeDifference.minutes.toFixed()).pad()}:${parseInt(attackTimeDifference.seconds.toFixed()).pad()}`;
        AttackCooldownTime = timeToAllowAttack <= now ? -1 : attackTimeDifference;
      }
      if (userDataObj.mtg_lastCardDrawnDateTime != null && userDataObj.mtg_lastCardDrawnDateTime != undefined) {
        var mtg_lastCardDrawnDateTime = new Date(userDataObj.mtg_lastCardDrawnDateTime);
        var timeToAllowDraw = Date.parse(new Date(Constants.moment(mtg_lastCardDrawnDateTime).add(Constants.drawCooldown, 'minutes').format(Constants.momentTimeFormat)));
        var drawTimeDifference = Constants.getTimeBetween(timeToAllowDraw, now);
        //console.log(drawTimeDifference);
        //var timeString = `${parseInt(drawTimeDifference.hours.toFixed()).pad()}:${parseInt(drawTimeDifference.minutes.toFixed()).pad()}:${parseInt(drawTimeDifference.seconds.toFixed()).pad()}`;
        DrawCooldownTime = timeToAllowDraw <= now ? -1 : drawTimeDifference;
      }
      /*if (userDataObj.mtg_claimCooldown != null && userDataObj.mtg_claimCooldown != undefined) {
        var mtg_lastClaimDateTime = new Date(userDataObj.mtg_claimCooldown);
        var timeToAllowClaim = Date.parse(new Date(Constants.moment(mtg_lastClaimDateTime).add(Constants.claimCooldown, 'minutes').format(Constants.momentTimeFormat)));
        var claimTimeDifference = Constants.getTimeBetween(timeToAllowClaim, now);
        console.log(claimTimeDifference);
        //var timeString = `${parseInt(claimTimeDifference.days.toFixed()).pad()} days + ${parseInt(claimTimeDifference.hours.toFixed()).pad()}:${parseInt(claimTimeDifference.minutes.toFixed()).pad()}:${parseInt(claimTimeDifference.seconds.toFixed()).pad()}`;
        ClaimCooldownTime = timeToAllowClaim <= now ? -1 : claimTimeDifference;
      }*/
      if (userDataObj.mtg_dailyPackCooldown != null && userDataObj.mtg_dailyPackCooldown != undefined) {
        var mtg_dailyPackCooldown = new Date(userDataObj.mtg_dailyPackCooldown);
        var timeToAllowDaily = Date.parse(new Date(Constants.moment(mtg_dailyPackCooldown).add(Constants.dailyCooldown, 'minutes').format(Constants.momentTimeFormat)));
        var dailyTimeDifference = Constants.getTimeBetween(timeToAllowDaily, now);
        //var timeString = `${parseInt(dailyTimeDifference.hours.toFixed()).pad()}:${parseInt(dailyTimeDifference.minutes.toFixed()).pad()}:${parseInt(dailyTimeDifference.seconds.toFixed()).pad()}`;
        DailyCooldownTime = timeToAllowDaily <= now ? -1 : dailyTimeDifference;
      }
      if (userDataObj.mtg_weeklyPackCooldown != null && userDataObj.mtg_weeklyPackCooldown != undefined) {
        var mtg_weeklyPackCooldown = new Date(userDataObj.mtg_weeklyPackCooldown);
        var timeToAllowWeekly = Date.parse(new Date(Constants.moment(mtg_weeklyPackCooldown).add(Constants.weeklyCooldown, 'minutes').format(Constants.momentTimeFormat)));
        var weeklyTimeDifference = Constants.getTimeBetween(timeToAllowWeekly, now);
        //var timeString = `${parseInt(weeklyTimeDifference.days.toFixed()).pad()} days + ${parseInt(weeklyTimeDifference.hours.toFixed()).pad()}:${parseInt(weeklyTimeDifference.minutes.toFixed()).pad()}:${parseInt(weeklyTimeDifference.seconds.toFixed()).pad()}`;
        WeeklyCooldownTime = timeToAllowWeekly <= now ? -1 : weeklyTimeDifference;
      }



      var cooldownRequest = {
        id: obj.id,
        draw: {
          shown: false,
          timer: null,//util.promisify(setTimeout),
          time: getTimerTime(DrawCooldownTime)
        },
        attack: {
          shown: false,
          timer: null,//util.promisify(setTimeout),
          time: getTimerTime(AttackCooldownTime)
        },
        /*claim: {
          shown: false,
          timer: null,//util.promisify(setTimeout),
          time: getTimerTime(ClaimCooldownTime)
        },*/
        daily: {
          shown: false,
          timer: null,//util.promisify(setTimeout),
          time: getTimerTime(DailyCooldownTime)
        },
        weekly: {
          shown: false,
          timer: null,//util.promisify(setTimeout),
          time: getTimerTime(WeeklyCooldownTime)
        }
      };

      var newTimer = {
        ownerID: obj.message.author.id,
        timerObj: util.promisify(setTimeout)
      };

      //timers.push(newTimer);
      notifications.push(cooldownRequest);
      Constants.NOTIFICATIONS.emit('start-timer', {cooldown: "draw", time: cooldownRequest.draw.time, id: obj.id});
      Constants.NOTIFICATIONS.emit('start-timer', {cooldown: "attack", time: cooldownRequest.attack.time, id: obj.id});
      //Constants.NOTIFICATIONS.emit('start-timer', {cooldown: "claim", time: cooldownRequest.claim.time, id: obj.id});
      Constants.NOTIFICATIONS.emit('start-timer', {cooldown: "daily", time: cooldownRequest.daily.time, id: obj.id});
      Constants.NOTIFICATIONS.emit('start-timer', {cooldown: "weekly", time: cooldownRequest.weekly.time, id: obj.id});
      /*Constants.USER.emit('start-timer', newTimer);
      Constants.USER.emit('start-timer', newTimer);
      Constants.USER.emit('start-timer', newTimer);
      Constants.USER.emit('start-timer', newTimer);*/

      obj.message.reply('you will now be notified when your draw, attack, daily, and weekly cooldowns are up!');
  }
}

module.exports = local;
HandleFunctionCall.RegisterFunction(["no", "not", "notify"], local.notify);
