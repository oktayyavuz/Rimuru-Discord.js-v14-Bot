const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const config = require("../config.json");

module.exports = {
  name: "say",
  description: "Sunucuda kaç üye olduğunu gösterir.",
  type: 1,
  options: [],

  run: async (client, interaction) => {
    // Tüm üyeleri önbelleğe al
    await interaction.guild.members.fetch();

    // Toplam üye sayısı
    const memberCount = interaction.guild.members.cache.filter(member => !member.user.bot).size || 0;

    // Sahte üye sayısı (hesap oluşturma tarihi 15 günden az olanlar)
    const fakeMemberCount = interaction.guild.members.cache.filter(member => {
      const createdAt = member.user.createdAt;
      return new Date().getTime() - createdAt.getTime() < 1296000000; // 15 gün = 15 * 24 * 60 * 60 * 1000 ms
    }).size || 0;

    const botCount = interaction.guild.members.cache.filter(member => member.user.bot).size || 0;

    const permissionsMemberCount = interaction.guild.members.cache.filter(member => member.permissions.has(PermissionsBitField.Flags.Administrator)).size;


    const iconURL = interaction.guild.iconURL({ dynamic: true }) || 'https://i.hizliresim.com/n5271mq.jpg';

    const embed = new EmbedBuilder()
      .setTitle(`${config["bot-adi"]} Bot`)
      .setThumbnail(iconURL)
      .setFooter({ text: interaction.user.tag + " İstedi." })
      .setDescription(
        `👤 | Toplam Üye: **${interaction.guild.memberCount}**\n✅ | Gerçek: **${memberCount}**\n❗ | Sahte: **${fakeMemberCount}** (son 15 günde açılan)\n🤖 | Bot: **${botCount}**\n 🛡 | Yönetici Yetkili: **${permissionsMemberCount}**`
      )
      .setColor("Random");

    // Mesajı gönder
    interaction.reply({ embeds: [embed] });
  },
};