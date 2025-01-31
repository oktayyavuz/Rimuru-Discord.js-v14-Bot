const { PermissionsBitField } = require("discord.js");
const db = require("croxydb");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "etiket-kanal-ayarla",
  description: "Yeni gelen kullanıcıların etiketleneceği kanalı ayarlar!",
  type: 1,
  options: [
    {
      name: "kanal",
      description: "Yeni gelen kullanıcıların etiketleneceği kanalı seçin!",
      type: 7,
      required: true,
      channel_types: [0], 
    },
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
      return interaction.reply({ content: "❌ | Kanalları Yönet Yetkin Yok!", ephemeral: true });

    const kanal = interaction.options.getChannel("kanal");

    db.set(`etiket_kanal_${interaction.guild.id}`, kanal.id);
    const embed = new EmbedBuilder()
      .setColor("Random")
      .setDescription(`✅ | Yeni gelen kullanıcılar <#${kanal.id}> kanalında etiketlenecek!`);

    interaction.reply({ embeds: [embed] });
  },
};