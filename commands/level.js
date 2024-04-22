const { AttachmentBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "level",
  description: "Seviyenizi görüntüleyin.",
  type: 1,
  options: [],

  run: async (client, interaction, db, Rank) => {
    const { user, guild } = interaction;

    const level = db.get(`levelPos_${user.id}${guild.id}`) || 0;
    const xp = db.get(`xpPos_${user.id}${guild.id}`) || 0;

    interaction.reply(`Seviye: ${level}, XP: ${xp}`);
  },
};
