const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const Discord = require("discord.js")
const config = require("../config.json"); 
module.exports = {
  name: "say",
  description: "Sunucuda kaç üye olduğunu gösterir.",
  type: 1,
  options: [],

  run: async(client, interaction) => {

    const memberCount = interaction.guild.members.cache.filter((member) => !member.user.bot).size || 0;
    const fakeMemberCount = interaction.guild.members.cache.filter((member) => {
      const createdAt = client.users.cache.get(member.id).createdAt;
      return new Date().getTime() - createdAt.getTime() < 1296000000;
    }).size || 0;
    const botCount = interaction.guild.members.cache.filter((member) => member.user.bot).size || 0;
    const permissionsMemberCount = interaction.guild.members.cache.filter((member) => member.permissions.has(PermissionsBitField.Flags.Administrator)).size || 0;
    const onlineMemberCount = interaction.guild.members.cache.filter(member => !member.user.bot && member.presence?.status === 'online').size || 0;
    const idleMemberCount = interaction.guild.members.cache.filter(member => !member.user.bot && member.presence?.status === 'idle').size || 0;
    const dndMemberCount = interaction.guild.members.cache.filter(member => !member.user.bot && member.presence?.status === 'dnd').size || 0;
    const iconURL = interaction.guild.iconURL({ dynamic: true }) || 'https://i.hizliresim.com/n5271mq.jpg';

    const embed = new EmbedBuilder()
      .setTitle(`${config["bot-adi"]} Bot`)
      .setThumbnail(iconURL)
      .setFooter({text: interaction.user.tag+" İstedi."})
      .setDescription(`👤 | Toplam Üye: **${interaction.guild.memberCount}** ( Çevrimiçi: **${onlineMemberCount}** | Boşta: **${idleMemberCount}** | Rahatsız Etmeyin **${dndMemberCount}** )\n✅ | Gerçek: **${memberCount}**\n❗ | Sahte: **${fakeMemberCount}**\n🤖 | Bot: **${botCount}**\n 🛡 | Yönetici Yetkili: **${permissionsMemberCount}**`)
      .setColor("Random");

    interaction.reply({embeds: [embed]});
  }
};
