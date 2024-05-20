const { ChannelType, EmbedBuilder } = require("discord.js");
const db = require("croxydb");


module.exports = {
  name: "özel-oda-sil",
  description: "Özel odanı silersin.",
  type: 1,
  options: [],
  run: async (client, interaction) => {
    const odasi = db.fetch(`oda_${interaction.user.id}`);
    if (!odasi) {
      const embed = new EmbedBuilder()
        .setColor("Random")
        .setDescription(`❌ | Özel oda bulunamadı!`);
      return interaction.reply({ embeds: [embed] });
    }

    const channel = await interaction.guild.channels.fetch(odasi);
    if (channel.type !== ChannelType.GuildVoice) {
      const embed = new EmbedBuilder()
        .setColor("Random")
        .setDescription(`❌ | Belirtilen kanal bir sesli kanal değil!`);
      return interaction.reply({ embeds: [embed] });
    }

    channel
      .delete()
      .then(() => {
        db.delete(`oda_${interaction.user.id}`);
        const embed = new EmbedBuilder()
          .setColor("Random")
          .setDescription(`✅ | Özel oda başarıyla silindi!`);
        interaction.reply({ embeds: [embed] });
      })
      .catch((error) => {
        console.error("Özel oda silinirken bir hata oluştu:", error);
        const embed = new EmbedBuilder()
          .setColor("Random")
          .setDescription(`❌ | Özel oda silinirken bir hata oluştu!`);
        interaction.reply({ embeds: [embed] });
      });
  },
};