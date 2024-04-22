const { PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "level-kaldır",
  description: "Seviyenizi azaltın.",
  type: 1,
  options: [
    {
      type: 6,
      name: "kullanıcı",
      description: "Hangi kullanıcıyı etkileyecek?",
      required: true
    },
    {
      type: 10,
      name: "miktar",
      description: "Kaç level silinecek?",
      required: true
    }
  ],

  run: async (client, interaction) => {
    const { options } = interaction;
    const member = options.getUser("kullanıcı");
    const levelToRemove = options.getNumber("miktar");

    if (!interaction.member.permissions.has("MANAGE_MESSAGES")) {
      return interaction.reply({ content: "❌ | Mesajları Yönet Yetkin Yok!" });
    }

    // Kullanıcıdan kaldırılan seviye mesaj ile bildiriliyor
    interaction.reply({ content: `${levelToRemove} seviye ${member} adlı kullanıcıdan kaldırıldı.` });
  }
};
