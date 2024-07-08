const { Client, EmbedBuilder, PermissionsBitField, GatewayIntentBits } = require("discord.js");
const moment = require('moment');
const config = require("../config.json");

module.exports = {
  name: "sunucu-bilgi",
  description: "Sunucu bilgileri!",
  type: 1,
  options: [],

  run: async (client, interaction) => {
    await interaction.guild.members.fetch();



    const kategori = interaction.guild.channels.cache.filter(c => c.type === 4).size;
    const ses = interaction.guild.channels.cache.filter(c => c.type === 2).size;
    const yazı = interaction.guild.channels.cache.filter(c => c.type === 0).size;
    const altbaşlk = interaction.guild.channels.cache.filter(c => c.type === 11).size;

    const sahip = await interaction.guild.fetchOwner();
    const bölge = interaction.guild.preferredLocale;
    let ülke;
    if (bölge === 'tr') {
      ülke = 'Türkiye';
    } else if (bölge === 'en-US') {
      ülke = 'Amerika';
    } else {
      ülke = interaction.guild.preferredLocale;
    }

    const doğrulamailk = interaction.guild.verificationLevel;
    let doğrulama;
    if (doğrulamailk === 0) doğrulama = 'Yok';
    if (doğrulamailk === 1) doğrulama = 'Düşük';
    if (doğrulamailk === 2) doğrulama = 'Orta';
    if (doğrulamailk === 3) doğrulama = 'Yüksek';
    if (doğrulamailk === 4) doğrulama = 'Çok Yüksek';

    const emojis = interaction.guild.emojis.cache.map(e => e.toString());
    const emojiArray = [];
    for (let i = 0; i < 32; i++) {
      emojiArray.push(emojis[i]);
    }
    const emoji = interaction.guild.emojis.cache.size === 0 ? 'Emoji Yok' : emojiArray.join(" ");

    const roles = interaction.guild.roles.cache.map(e => e.toString());
    const roleArray = [];
    for (let i = 0; i < 8; i++) {
      if (roles[i] !== '@everyone') {
        roleArray.push(roles[i] + ' ');
      }
    }
    const rol = interaction.guild.roles.cache.size < 5 ? 'Yönetilebilir Rol Yok' : roleArray.join(" ");

    const embed = new EmbedBuilder()
      .setColor("Purple")
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }) || 'https://cdn.discordapp.com/attachments/985147469363036232/1001388484868714527/6134072535d460dc1097a60a729b43c2.png')
      .addFields(
        { name: `Sunucu Adı`, value: `\"${interaction.guild.name}\"`, inline: true },
        { name: `Sunucu ID`, value: `\"${interaction.guild.id}\"`, inline: true },
        { name: `Sunucu Sahibi`, value: `\"${sahip.user.tag}\"`, inline: true },
        { name: `Sunucu Bölgesi`, value: `\"${ülke}\"`, inline: true },
        { name: `Oluşturulma Tarihi`, value: `\"${moment(interaction.guild.createdAt).format('D MMMM YYYY')}\"`, inline: true },
        { name: `Takviye Seviyesi`, value: `\"${interaction.guild.premiumTier}. Seviye - ${interaction.guild.premiumSubscriptionCount} Takviye\"`, inline: true },
        { name: `Kişi-Bot Sayısı`, value: `\"${interaction.guild.memberCount}-${interaction.guild.members.cache.filter(x => x.user.bot).size}\"`, inline: true },
        { name: `Doğrulama Seviyesi`, value: `\"${doğrulama}\"`, inline: true },
        { name: `Kanal Sayısı`, value: `\"${interaction.guild.channels.cache.size} (${kategori} Kategori Kanalları\n${ses} Ses Kanalları\n${yazı} Yazı Kanalları\n${altbaşlk} Altbaşlık Kanalları)\"`, inline: true },
        { name: `Emojiler`, value: `\"${interaction.guild.emojis.cache.filter(a => a.animated).size}-${interaction.guild.emojis.cache.filter(a => !a.animated).size}\" ${emoji}`, inline: true },
        { name: `Roller`, value: `\"${interaction.guild.roles.cache.size}\" ${rol}`, inline: true }
      )
      .setFooter({ text: `${interaction.user.tag} istedi.` });

    interaction.reply({ embeds: [embed] });
  }
};
