const { PermissionsBitField, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder,UserSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const db = require("croxydb");
const config = require('../config.json');

function cleanupPrivateRoom(userId, channelId) {
  db.delete(`privateRoom_${userId}`);
  db.delete(`privateRoom_${channelId}`);
}

module.exports = {
  name: "özel-oda",
  description: "Özel oda sistemini başlatır.",
  options: [
    {
      name: "kategori",
      description: "Özel odaların oluşturulacağı kategori",
      type: 7,
      required: true,
      channel_types: [4]
    }
  ],
  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: "Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız!", ephemeral: true });
    }
    const category = interaction.options.getChannel("kategori");
    
    if (category.type !== ChannelType.GuildCategory) {
      return interaction.reply({ content: "Lütfen geçerli bir kategori seçin!", ephemeral: true });
    }

    db.set(`privateRoomCategory_${interaction.guildId}`, category.id);

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("🎉 Özel Oda Sistemi")
      .setDescription(`Özel odanızı oluşturmak için aşağıdaki butona tıklayın.\nOdalar "${category.name}" kategorisi altında oluşturulacak.`)
      .setFooter({ text: "Özel odanızı oluşturun ve yönetin!" });

    const button = new ButtonBuilder()
      .setCustomId("private_room_create")
      .setLabel("Özel Oda Aç")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("🔒");

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.channel.send({ embeds: [embed], components: [row] });

    await interaction.reply({ content: "Özel oda sistemi başarıyla ayarlandı!", ephemeral: true });

  },
};
