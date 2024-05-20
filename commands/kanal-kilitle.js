const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "kilitle",
  description: "Kanalı mesaj gönderilmesine kapatır.",
  type: 1,
  options: [
    {
      name: "durum",
      description: "Kanalın durumunu belirleyin.",
      type: 3, // 3: STRING
      required: true,
      choices: [
        {
          name: "Açık",
          value: "acik",
        },
        {
          name: "Kapalı",
          value: "kapali",
        },
      ],
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

    const durum = interaction.options.getString("durum");
    const channel = interaction.channel;

    if (durum === "kapali") {
      if (!channel.permissionsFor(interaction.guild.id).has(PermissionsBitField.Flags.SendMessages))
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FFD700")
              .setTitle("🔒 | Uyarı")
              .setDescription("Kanal zaten mesaj gönderimine kapalı!"),
          ],
        });

      channel.permissionOverwrites.edit(interaction.guild.id, {
        SendMessages: false,
      });

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#00FF00")
            .setTitle("✅ | Başarılı")
            .setDescription("Kanal başarılı bir şekilde mesaj gönderimine kapatıldı!"),
        ],
      });
    } else if (durum === "acik") {
      if (channel.permissionsFor(interaction.guild.id).has(PermissionsBitField.Flags.SendMessages))
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FFD700")
              .setTitle("🔓 | Uyarı")
              .setDescription("Kanal zaten mesaj gönderimine açık!"),
          ],
        });

      channel.permissionOverwrites.edit(interaction.guild.id, {
        SendMessages: true,
      });

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#00FF00")
            .setTitle("✅ | Başarılı")
            .setDescription("Kanal başarılı bir şekilde mesaj gönderimine açıldı!"),
        ],
      });
    } else {
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("❌ | Hata")
            .setDescription("Geçersiz bir durum belirttiniz!"),
        ],
      });
    }
  },
};