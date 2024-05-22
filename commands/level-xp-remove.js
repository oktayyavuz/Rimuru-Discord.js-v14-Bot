const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "xp-kaldır",
  description: "Belirtilen kullanıcıdan belirtilen miktarda XP kaldırır.",
  type: 1,
  options: [
    {
      name: "kullanıcı",
      description: "XP kaldırmak istediğiniz kullanıcıyı etiketleyin.",
      type: 6,
      required: true,
    },
    {
      name: "miktar",
      description: "Kaldırmak istediğiniz XP miktarını belirtin.",
      type: 4,
      required: true,
    },
  ],

  run: async (client, interaction, db) => {
    const { user, guild, options } = interaction;

    const member = guild.members.cache.get(options.getUser("kullanıcı").id);
    const xp = options.getInteger("miktar");

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({ content: "❌ | Buna Yetkin Yok!", ephemeral: true });
    }
    if (!member) {
      return interaction.reply({
        content: "Belirtilen kullanıcı bulunamadı.",
        ephemeral: true,
      });
    }

    const currentXP = db.fetch(`xpPos_${member.id}${guild.id}`) || 0;
    if (currentXP < xp) {
      return interaction.reply({
        content: `❌ | ${member.user.username}'ın şu anki XP'si ${currentXP}. Bu miktarda XP kaldıramazsınız.`,
        ephemeral: true,
      });
    }

    db.subtract(`xpPos_${member.id}${guild.id}`, xp);

    const newXP = db.fetch(`xpPos_${member.id}${guild.id}`) || 0;

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle(`${member.user.username}'dan ${xp} XP kaldırıldı.`)
      .setDescription(`${member} artık ${newXP} XP'ye sahip.`);

    interaction.reply({ embeds: [embed] });
  },
};
