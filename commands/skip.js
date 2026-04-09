const { EmbedBuilder } = require('discord.js');
const musicPlayer = require('../helpers/music/MusicPlayer');

module.exports = {
  name: "skip",
  description: "çalan şarkıyı atlar ve sonraki şarkıya geçer",
  type: 1,

  run: async(client, interaction) => {
    try {
      // Kullanıcı ses kanalında mı?
      if (!interaction.member.voice.channel) {
        return interaction.reply({ content: "❌ Bu komutu kullanmak için bir ses kanalında olmalısınız.", ephemeral: true });
      }
      
      // Bot ses kanalında mı?
      if (!interaction.guild.members.me.voice.channel) {
        return interaction.reply({ content: "❌ Bot şu anda ses kanalında değil.", ephemeral: true });
      }
      
      // Aynı ses kanalında mı?
      if (interaction.member.voice.channel.id !== interaction.guild.members.me.voice.channel.id) {
        return interaction.reply({ 
          content: "❌ Bu komutu kullanmak için botla aynı ses kanalında olmalısınız.", 
          ephemeral: true 
        });
      }
      
      // Çalan şarkı var mı?
      const nowPlaying = musicPlayer.getNowPlaying(interaction.guild.id);
      if (!nowPlaying) {
        return interaction.reply({ content: "❌ Şu anda çalan bir şarkı yok.", ephemeral: true });
      }
      
      // Kuyruk durumu
      const queue = musicPlayer.getQueue(interaction.guild.id);
      
      // Yanıt oluştur
      const embed = new EmbedBuilder()
        .setTitle("⏭️ Şarkı Atlandı")
        .setDescription(`[${nowPlaying.title}](${nowPlaying.url})`)
        .setThumbnail(nowPlaying.thumbnail)
        .setColor('#3498db');
      
      // Sonraki şarkı bilgisini ekle
      if (queue.length > 0) {
        const nextTrack = queue[0];
        embed.addFields({ 
          name: 'Sıradaki Şarkı', 
          value: `[${nextTrack.title}](${nextTrack.url})` 
        });
      } else {
        embed.addFields({ 
          name: 'Sıradaki Şarkı', 
          value: 'Kuyrukta başka şarkı yok.' 
        });
      }
      
      // Komutu kullanan kişi bilgisini ekle
      embed.setFooter({ 
        text: `${interaction.user.username} tarafından atlandı.`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      });
      
      // Şarkıyı atla (bir sonraki çalınır)
      const player = musicPlayer.players.get(interaction.guild.id);
      if (player) {
        player.stop();
      }
      
      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Şarkı atlama hatası:', error);
      await interaction.reply({ 
        content: `❌ Şarkı atlanırken bir hata oluştu: ${error.message}`, 
        ephemeral: true 
      });
    }
  }
}; 