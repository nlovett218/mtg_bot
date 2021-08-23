/*
	MailHandler
	suff0cati0n
*/

var nodemailer = require('nodemailer');
var Constants = require('../functions/util/Constants');
const LOG = require('../functions/util/LogAction');
const util = require('util');
const fs = require('fs');

var transporter = null;

async function LoadHTMLContents(filePath)
{
	var contents = "<body>ERROR PARSING HTML CONTENTS</body>";

	try {
		var data = fs.readFileSync(filePath, 'utf8');
    	//console.log(data.toString()); 
    	contents = data;
    	return contents;
	}
	catch (e) {
		console.log('Error: ', e.stack);
		return contents;
	}

	return contents;
}

var local = {

	init:async function()
	{
		transporter = nodemailer.createTransport({
	  	service: 'gmail',
	  	auth: {
	    		user: 'magicthegatheringbot@gmail.com',
	    		pass: 'jrojbnuwvhqvyofv'
	  		}
		});
	},

	sendMail:async function(subject, toList, type, data) 
	{
		if (subject == null || toList == null || type == null)
		{
			console.log("Invalid Mail paramaters!");
			return;
		}

		var htmlContents = null;
		switch(type.toLowerCase())
		{
			case "onpurchase":
				htmlContents = await LoadHTMLContents(Constants.MailTypes[type].file);

				if (htmlContents != null)
				{
					htmlContents = htmlContents.replace("{{EMAIL_TITLE}}", data.KEY);
					htmlContents = htmlContents.replace("{{EMAIL_SUBTITLE}}", Constants.MailTypes[type].EMAIL_SUBTITLE);
					htmlContents = htmlContents.replace("{{EMAIL_BODY}}", Constants.MailTypes[type].EMAIL_BODY);
				}
			break;
		}

		if (htmlContents == null)
		{
			console.log("HTML Contents is null!");
			return;
		}

	  let info = await transporter.sendMail({
	    from: '"MKOTD" <magicthegatheringbot@gmail.com>', // sender address
	    to: toList, // list of receivers
	    subject: subject, // Subject line
	    //text: "Hello world?", // plain text body
	    html: htmlContents, // html body
	  });

	  console.log("Message sent: %s", info.messageId);
	}
}

module.exports = local;

local.init();