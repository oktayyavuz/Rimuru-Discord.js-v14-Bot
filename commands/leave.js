const { EmbedBuilder } = require('discord.js');
const musicPlayer = require('../helpers/music/MusicPlayer');

module.exports = {
  name: "leave",
  description: "botu ses kanalından çıkarır ve müzik çalmayı durdurur",
  type: 1,

  run: async(client, interaction) => {
    try {
      // Kullanıcı ses kanalında mı?
      if (!interaction.member.voice.channel) {
        return interaction.reply({ content: "❌ Bu komutu kullanmak için bir ses kanalında olmalısınız.", ephemeral: true });
      }
      
      // Bot ses kanalında mı?
      if (!interaction.guild.members.me.voice.channel) {
        return interaction.reply({ content: "❌ Bot zaten ses kanalında değil.", ephemeral: true });
      }
      
      // Kullanıcı botla aynı kanalda mı?
      if (interaction.member.voice.channel.id !== interaction.guild.members.me.voice.channel.id) {
        return interaction.reply({ 
          content: "❌ Bu komutu kullanmak için botla aynı ses kanalında olmalısınız.", 
          ephemeral: true 
        });
      }
      
      // Kanaldan çıkmadan önce bilgileri al
      const channelName = interaction.guild.members.me.voice.channel.name;
      
      // Ses kanalından çık ve çalmayı durdur
      musicPlayer.leave(interaction.guild.id);
      
      // Şimdi çalınanı DB'den temizle
      const db = require('croxydb');
      db.delete(`nowPlaying_${interaction.guild.id}`);
      
      // Başarılı mesajı
      const embed = new EmbedBuilder()
        .setTitle("👋 Ses Kanalından Ayrıldım")
        .setDescription(`**${channelName}** kanalından ayrıldım ve müzik çalmayı durdurdum.`)
        .setColor('#3498db')
        .setFooter({ 
          text: `${interaction.user.username} tarafından kullanıldı.`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Ses kanalından ayrılma hatası:', error);
      await interaction.reply({ 
        content: `❌ Ses kanalından ayrılırken bir hata oluştu: ${error.message}`, 
        ephemeral: true 
      });
    }
  }
}; 