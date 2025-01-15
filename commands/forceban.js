const { PermissionsBitField } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: "forceban",
  description: "ID ile kullanıcı yasaklarsın!",
  type: 1,
  options: [
    {
      name: "id",
      description: "Lütfen bir kullanıcı ID girin!",
      type: 3,
      required: true
    },
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({ content: "❌ | Üyeleri Yasakla Yetkin Yok!", ephemeral: true });
    }

    const id = interaction.options.getString("id");

    try {
      await interaction.guild.members.ban(id);
      const embed = new EmbedBuilder()
        .setColor("Random")
        .setDescription(`${id} ✅ | IDLI Kullanıcı Başarıyla Yasaklandı!`);
      interaction.reply({ embeds: [embed] });

      // Modlog kanalına mesaj gönderme
      try {
        const modLogChannelId = db.get(`modlogK_${interaction.guild.id}`);
        if (modLogChannelId) {
          const modLogChannel = client.channels.cache.get(modLogChannelId);
          if (modLogChannel) {
            const logEmbed = new EmbedBuilder()
              .setTitle('Kullanıcı Yasaklandı')
              .addFields(
                { name: 'Yasaklanan Kullanıcı ID', value: `${id}` },
                { name: 'Yasaklayan Yetkili', value: `${interaction.user}` },
              )
              .setTimestamp();

            modLogChannel.send({ embeds: [logEmbed] });
          }
        }
      } catch (error) {
        console.error('Modlog gönderiminde hata:', error);
      }

    } catch (error) {
      let errorMessage = "❌ | Kullanıcı yasaklanırken bir hata oluştu!";
      if (error.code === 50013) {
        errorMessage = "❌ | Kullanıcıyı yasaklamak için yeterli yetkim yok!";
      } else if (error.code === 10013) {
        errorMessage = "❌ | Geçersiz kullanıcı ID'si!";
      }

      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setDescription(errorMessage);
      interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
};
