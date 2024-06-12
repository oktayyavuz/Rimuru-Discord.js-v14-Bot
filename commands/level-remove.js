const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "level-kaldır",
  description: "Belirtilen kullanıcıdan belirtilen seviyeyi kaldırır.",
  type: 1,
  options: [
    {
      name: "kullanıcı",
      description: "Seviye kaldırmak istediğiniz kullanıcıyı etiketleyin.",
      type: 6,
      required: true,
    },
    {
      name: "seviye",
      description: "Kaldırmak istediğiniz seviyeyi belirtin.",
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

    const currentLevel = db.fetch(`levelPos_${member.id}${guild.id}`) || 0;
    if (currentLevel < level) {
      return interaction.reply({
        content: `❌ | ${member.user.username}'in şu anki seviyesi ${currentLevel}. ${level} seviyesini kaldıramazsınız.`,
        ephemeral: true,
      });
    }

    db.subtract(`levelPos_${member.id}${guild.id}`, level);

    let newLevel = db.fetch(`levelPos_${member.id}${guild.id}`);
    if (newLevel === undefined) {
      newLevel = 0;
    }

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle(`${member.user.username}'dan ${level} seviye kaldırıldı.`)
      .setDescription(`${member} artık ${newLevel} seviyesine düştü.`);

    interaction.reply({ embeds: [embed] });
  },
};
