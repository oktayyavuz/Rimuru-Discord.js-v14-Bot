const { PermissionsBitField } = require("discord.js");
const db = require("croxydb")
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "giriş-çıkış",
  description: "Giriş Çıkış Sistemini Ayarlarsın!",
  type: 1,
  options: [
    {
      name: "giriskanal",
      description: "Giriş çıkış kanalını ayarlarsın!",
      type: 7,
      required: true,
      channel_types: [0],
    },
    {
      name: "cikiskanal",
      description: "Giriş çıkış kanalını ayarlarsın!",
      type: 7,
      required: true,
      channel_types: [0],
    },
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
      return interaction.reply({ content: "❌ | Kanalları Yönet Yetkin Yok!", ephemeral: true });

    const kanal2 = interaction.options.getChannel("giriskanal");
    db.set(`hgbb_${interaction.guild.id}`, { channel: kanal2.id });

    const kanal3 = interaction.options.getChannel("cikiskanal");
    db.set(`hgbb1_${interaction.guild.id}`, { channel: kanal3.id });

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setDescription(`✅ | Hoşgeldin kanalı <#${kanal2.id}> Görüşürüz kanalı <#${kanal3.id}> olarak ayarlandı!`)
      .setImage("https://i.hizliresim.com/41b2xmi.gif")

    interaction.reply({ embeds: [embed] });
  },
};