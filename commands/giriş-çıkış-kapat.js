const { PermissionsBitField } = require("discord.js");
const db = require("croxydb")
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "giriş-çıkış-kapat",
  description: "Giriş Çıkış Sistemini kapatırsın!",
  type: 1,
  options: [],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ content: "❌ | Kanalları Yönet Yetkin Yok!", ephemeral: true });

    db.delete(`hgbb_${interaction.guild.id}`);
    db.delete(`hgbb1_${interaction.guild.id}`);

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setDescription("✅ | Hoşgeldin Güle Güle Kanalı Başarıyla Sıfırlandı!");

    interaction.reply({ embeds: [embed] });
  }
};