const { EmbedBuilder , PermissionsBitField} = require("discord.js");

module.exports = {
  name: "level-ekle",
  description: "Belirtilen kullanıcıya belirtilen seviye ekler.",
  type: 1,
  options: [
    {
      name: "kullanıcı",
      description: "Level eklemek istediğiniz kullanıcıyı etiketleyin.",
      type: 6,
      required: true,
    },
    {
      name: "seviye",
      description: "Eklemek istediğiniz seviyeyi belirtin.",
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

    db.add(`levelPos_${member.id}${guild.id}`, level);

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle(`${member.user.username}'a ${level} seviye eklendi.`)
      .setDescription(`${member} artık ${db.fetch(`levelPos_${member.id}${guild.id}`)} seviyeye ulaştı.`);

    interaction.reply({ embeds: [embed] });
  },
};
