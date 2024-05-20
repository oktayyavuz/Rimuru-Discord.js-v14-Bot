const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "level-kaldır",
  description: "Belirtilen kullanıcıdan belirtilen seviye kadar çıkarır.",
  type: 1,
  options: [
    {
      name: "kullanıcı",
      description: "Çıkarmak istediğiniz kullanıcıyı etiketleyin.",
      type: 6,
      required: true,
    },
    {
      name: "seviye",
      description: "Çıkarmak istediğiniz seviyeyi belirtin.",
      type: 4,
      required: true,
    },
  ],

  run: async (client, interaction, db) => {
    const { user, guild, options } = interaction;

    const member = guild.members.cache.get(options.getUser("kullanıcı").id);
    const level = options.getInteger("seviye");

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({ content: "❌ | Buna Yetkin Yok!", ephemeral: true });
    }

    if (!member) {
      return interaction.reply({
        content: "Belirtilen kullanıcı bulunamadı.",
        ephemeral: true,
      });
    }

    
    const currentLevel = db.fetch(`level_${member.id}${guild.id}`) || 0;

    if (currentLevel - level < 0) {
      return interaction.reply({
        content: "Belirtilen kullanıcının seviyesi, bu kadar çıkarmak için yeterli değil.",
        ephemeral: true,
      });
    }

    db.subtract(`levelPos_${member.id}${guild.id}`, level);

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle(`${member.user.username}'dan ${level} seviye çıkarıldı.`)
      .setDescription(`${member} artık ${db.fetch(`levelPos_${member.id}${guild.id}`)} seviyeye ulaştı.`);

    interaction.reply({ embeds: [embed] });
  },
};
