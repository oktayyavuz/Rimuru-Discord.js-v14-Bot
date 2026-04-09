const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
const dbManager = require('../helpers/database');
const config = require('../config.json');

module.exports = {
  name: "level",
  description: "level bilgilerini gösterir",
  type: 1,
  options: [
    {
      name: "kullanıcı",
      description: "Level bilgilerini görmek istediğiniz kullanıcı",
      type: ApplicationCommandOptionType.User,
      required: false
    }
  ],

  run: async (client, interaction) => {
    try {
      const guildId = interaction.guild.id;

      // Sistemin aktif olup olmadığını kontrol et
      const globalLevelSystemEnabled = dbManager.get('globalLevelSystem') !== false;
      const guildLevelSystemEnabled = dbManager.get(`level_${guildId}`);

      if (!globalLevelSystemEnabled) {
        return interaction.reply({ content: '❌ Level sistemi global olarak devre dışı bırakılmış.', ephemeral: true });
      }

      if (!guildLevelSystemEnabled) {
        return interaction.reply({ content: '❌ Bu sunucuda level sistemi aktif değil.', ephemeral: true });
      }

      // Kullanıcıyı belirle (belirtilmediyse komutu kullanan kişi)
      const targetUser = interaction.options.getUser('kullanıcı') || interaction.user;
      const userId = targetUser.id;

      // Level verilerini al
      const userXp = dbManager.getUserLevelData(guildId, userId);

      // Level başına gereken XP miktarı
      const levelXpPerLevel = dbManager.get('levelXp') || config.levelXp || 100;

      // Sonraki seviye için gereken XP
      const nextLevelNeeded = levelXpPerLevel * (userXp.level + 1);
      const remainingXp = Math.max(0, nextLevelNeeded - userXp.xp);

      // İlerleme çubuğu (20 karakter uzunluğunda)
      const progress = Math.min(Math.floor((userXp.xp / nextLevelNeeded) * 20), 20);
      const progressBar = '█'.repeat(progress) + '░'.repeat(20 - progress);

      // Embed oluştur
      const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setTitle(`${targetUser.username} Level Bilgileri`)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'Level', value: `${userXp.level}`, inline: true },
          { name: 'XP', value: `${userXp.xp}/${nextLevelNeeded}`, inline: true },
          { name: 'Toplam XP', value: `${userXp.totalXp}`, inline: true },
          {
            name: 'İlerleme',
            value: `${progressBar} [${Math.round((userXp.xp / nextLevelNeeded) * 100)}%]\nSonraki seviye için ${remainingXp} XP gerekli`
          }
        )
        .setFooter({ text: `Her mesaj: ${dbManager.get('mesajXp') || config.mesajXp || 5} XP | Ses (dakika): ${dbManager.get('sesXp') || config.sesXp || 10} XP` })
        .setTimestamp();

      // Yanıt gönder
      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Level komutu hatası:', error);
      await interaction.reply({ content: `❌ Bir hata oluştu: ${error.message}`, ephemeral: true });
    }
  }
};
