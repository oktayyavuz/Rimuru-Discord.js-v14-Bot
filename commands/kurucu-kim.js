const { Client, Permissions, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "kurucu",
  description: "Sunucunun kurucusunu görürsün!",
  type: 1,
  options: [],

  run: async (client, interaction) => {
    const owner = interaction.guild.members.cache.get(interaction.guild.ownerId);

    const embed = new EmbedBuilder()
      .setColor("#7289DA")
      .setTitle("Sunucunun Kurucusu")
      .setDescription(`Sunucunun kurucusu: <@${owner.user.id}> 👑`);

    interaction.reply({ embeds: [embed] });
  },
};
