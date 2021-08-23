/*

	KEY GENERATOR

*/

//const BotInfo = require('./classes/BotInfo');
const LOG = require('../functions/util/LogAction');
const util = require('util');
const Constants = require('../functions/util/Constants');
const fs = require('fs');
var keygen = require("keygenerator");

var local = {
	generateKey:function()
	{
		var key = keygen._({
    		forceUppercase: true,
    		sticks: false,
    		numbers: true,
    		length: 20,
		});

		return `MKOTD-${key}`;
	}
};

module.exports = local;


/*
 * Default configuration
 *
 * chars: true
 * sticks: false
 * numbers: true
 * specials: false
 * sticks: false
 * length: 8
 * forceUppercase: false
 * forceLowercase: false
 * exclude:[ ]
 *
 */