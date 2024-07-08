const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "kick",
  description: 'Kullanıcıyı Sunucudan Atarsın.',
  type: 1,
  options: [
    {
      name: "user",
      description: "Atılacak Kullanıcıyı Seçin.",
      type: 6,
      required: true
    },
  ],
  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({ content: "❌ | Üyeleri At Yetkin Yok!", ephemeral: true });
    }

    const user = interaction.options.getMember('user');

    if (!user) {
      return interaction.reply({ content: "❌ | Geçersiz kullanıcı!", ephemeral: true });
    }

    if (user.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({ content: "❌ | Bu Kullanıcının Kullanıcıları Atma Yetkisi Olduğu İçin Onu Atamadım.", ephemeral: true });
    }

    try {
      await user.kick();
      const embed = new EmbedBuilder()
        .setColor("Random")
        .setDescription(`✅ | Başarıyla Üyeyi Attım!`);
      interaction.reply({ embeds: [embed] });
    } catch (error) {
      let errorMessage = "❌ | Kullanıcıyı atarken bir hata oluştu!";
      if (error.code === 50013) {
        errorMessage = "❌ | Kullanıcıyı atmak için yeterli yetkim yok!";
      }

      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setDescription(errorMessage);
      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};