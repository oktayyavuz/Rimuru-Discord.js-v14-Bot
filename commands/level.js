const { AttachmentBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "level",
  description: "Bir kullanıcının seviyesini görüntüleyin.",
  type: 1,
  options: [
    {
      name: "kullanıcı",
      description: "Seviyesini görüntülemek istediğiniz kullanıcıyı etiketleyin.",
      type: 6,
      required: false,
    },
  ],

  run: async (client, interaction, db, Rank) => {
    const { user, guild } = interaction;
    const targetUser = interaction.options.getUser("kullanıcı") || user;

    const level = db.get(`levelPos_${targetUser.id}${guild.id}`) || 0;
    const xp = db.get(`xpPos_${targetUser.id}${guild.id}`) || 0;

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle(`${targetUser.username} kullanıcısının Seviyesi`)
      .setDescription(`Seviye: **${level}**\nXP: **${xp}**`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setFooter({ text: `${guild.name}`, iconURL: guild.iconURL() });

    interaction.reply({ embeds: [embed] });
  },
};
