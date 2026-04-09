const db = require("croxydb");
const { EmbedBuilder } = require("discord.js");
const config = require("../config.json");

module.exports = {
  name: "messageCreate",
  run: async (client, message) => {
    if (!message.guild || message.author.bot) return;

    const guildId = message.guild.id;
    const userId = message.author.id;

    const isLevelEnabled = db.fetch(`acikmiLevel_${guildId}`);
    if (!isLevelEnabled) return;

    // Spam engelleme (Saniyede 1 kez XP)
    const now = Date.now();
    const lastXp = db.fetch(`last_xp_${guildId}_${userId}`) || 0;
    if (now - lastXp < 5000) return; // 5 saniye bekleme süresi

    const level = db.fetch(`level_${guildId}_${userId}`) || 1;
    const experience = db.fetch(`experience_${guildId}_${userId}`) || 0;
    
    // Level hesaplama formülü
    const experiencePointsForNextLevel = 5 * Math.pow(level, 2) + 50 * level + (config.levelXp || 100);
    const experiencePerMessage = 10;

    db.add(`experience_${guildId}_${userId}`, experiencePerMessage);
    db.set(`last_xp_${guildId}_${userId}`, now);

    if (experience + experiencePerMessage >= experiencePointsForNextLevel) {
      db.set(`level_${guildId}_${userId}`, level + 1);
      db.set(`experience_${guildId}_${userId}`, 0); // veya artan miktarı ekle

      const logChannelId = db.fetch(`level_log_${guildId}`);
      if (logChannelId) {
        const logChannel = message.guild.channels.cache.get(logChannelId);
        if (logChannel) {
          const rankMessage = new EmbedBuilder()
            .setTitle(`${message.author.username} Seviyesi Arttı!`)
            .setDescription(`${message.author} kullanıcısının seviyesi <:level:1033329322044303410> **${level + 1}** seviyeye ulaştı!`)
            .setColor("Green");
          logChannel.send({ embeds: [rankMessage] }).catch(() => {});
        }
      }
    }
  }
};
