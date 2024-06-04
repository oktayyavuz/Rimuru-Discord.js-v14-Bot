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
    const xpToRemove = options.getInteger("miktar");

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
    const currentLevel = db.fetch(`levelPos_${member.id}${guild.id}`) || 0;
    const totalXP = (currentLevel * 100) + currentXP;

    if (totalXP < xpToRemove) {
      return interaction.reply({
        content: `❌ | ${member.user.username}'ın şu anki toplam XP'si ${totalXP}. Bu miktarda XP kaldıramazsınız.`,
        ephemeral: true,
      });
    }

    const newTotalXP = totalXP - xpToRemove;
    const newLevel = Math.floor(newTotalXP / 100);
    const remainingXP = newTotalXP % 100;

    db.set(`xpPos_${member.id}${guild.id}`, remainingXP);
    db.set(`levelPos_${member.id}${guild.id}`, newLevel);

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle(`${member.user.username}'dan ${xpToRemove} XP kaldırıldı.`)
      .setDescription(`${member} artık ${remainingXP} XP'ye ve ${newLevel} seviyesine sahip.`);

    interaction.reply({ embeds: [embed] });
  },
};
