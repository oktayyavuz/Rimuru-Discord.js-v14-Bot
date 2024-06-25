const Discord = require("discord.js");
const db = require("croxydb");
const config = require('../config.json');

const userVoiceJoinTimes = {};

module.exports = {
    name: Discord.Events.VoiceStateUpdate,

    run: async (client, oldState, newState) => {
        if(!db.fetch(`ozelodasistemi_${newState.guild.id}`)) return;

        const myDb = {
            sohbetses: db.fetch(`ozelodasistemi_${newState.guild.id}`)
        };
        const { sohbetses } = myDb;
        const sesli = db.fetch(`oda_${newState.id}`);
        const sesli2 = db.fetch(`oda2${newState.id}`);

        if(sesli && sesli2) {
            if (newState.member.voice.channel != null && newState.member.voice.channel.name.startsWith(sohbetses)) {
                const ozelOdaCategory = db.fetch(`ozelOdaSystemCategory_${newState.guild.id}`);
                const channel = await newState.guild.channels.create({
                    name: `║👤 ${newState.member.displayName}`,
                    type: Discord.ChannelType.GuildVoice,
                    parent: ozelOdaCategory.category,
                    permissionOverwrites: [],
                }).then((sesli) => {
                    newState.member.voice.setChannel(sesli.id);
                    db.set(`oda_${newState.id}`, sesli.id);
                    db.set(`oda2_${newState.id}`, sesli);
                    sesli.permissionOverwrites.create(
                        newState.guild.roles.everyone, { ViewChannel: false }
                    );
                });
            }
        }

        if (newState.member.user.bot) return;
        const userId = newState.member.id;

        if (newState.channel) { 
            userVoiceJoinTimes[userId] = Date.now();
        } else { 
            if (userVoiceJoinTimes[userId]) {
                const voiceTimeInChannel = Date.now() - userVoiceJoinTimes[userId];
                const guildId = newState.guild.id;
                const xpToAdd = Math.floor(voiceTimeInChannel / 60000) * config.sesXp;
                if (xpToAdd > 0) {
                    db.add(`xpPos_${userId}${guildId}`, xpToAdd);
                }
                delete userVoiceJoinTimes[userId];
            }
        }
    }
};
