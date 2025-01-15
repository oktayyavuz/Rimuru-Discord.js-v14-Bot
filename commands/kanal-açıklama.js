const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "kanal-açıklama",
  description: "Kanal Açıklamasını Değiştirsin!",
  type: 1,
  options: [
    {
      name: "kanal",
      description: "Açıklaması Değiştirilicek Kanalı Ayarlarsın!",
      type: 7,
      required: true,
      channel_types: [0],
    },
    {
      name: "açıklama",
      description: "Kanal Açıklamasını Girin!",
      type: 3,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("❌ | Hata")
            .setDescription("Kanalları yönet yetkin yok!"),
        ],
        ephemeral: true,
      });

    const aciklama = interaction.options.getString("açıklama");
    const kanal2 = interaction.options.getChannel("kanal");

    kanal2.setTopic(aciklama);

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#00FF00")
          .setTitle("✅ | Başarılı")
          .setDescription(
            `<#${kanal2.id}> Kanalının açıklaması başarıyla **${aciklama}** olarak değiştirildi.`
          ),
      ],
    });
  },
};