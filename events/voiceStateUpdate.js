const Discord = require("discord.js");
const db = require("croxydb");
const config = require('../config.json');
const { voiceEvent } = require('./levelSystem');

const userVoiceJoinTimes = {};

module.exports = {
    name: voiceEvent.name,
    run: voiceEvent.run
};
