const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: "öneri-al",
  description: "Öneri kanalını belirleyin.",
  type: 1,
  options: [
    {
      type: 7, // CHANNEL
      name: "kanal",
      description: "Önerilerin gönderileceği kanalı seçin.",
      required: true
    }
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({ content: "❌ | Kanalları Yönetme yetkiniz yok!", ephemeral: true });
    }

    const kanal = interaction.options.getChannel("kanal");
    db.set(`önerikanal_${interaction.guild.id}`, kanal.id);

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setDescription(`✅ | Öneri kanalı başarıyla ${kanal} olarak ayarlandı!`);

    return interaction.reply({ embeds: [embed] });
  }
};
