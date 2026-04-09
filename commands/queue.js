const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const musicPlayer = require('../helpers/music/MusicPlayer');

module.exports = {
  name: "queue",
  description: "müzik kuyruğunu görüntüler",
  type: 1,

  run: async(client, interaction) => {
    try {
      // Kuyruk ve şu anda çalınan şarkıyı al
      const queue = musicPlayer.getQueue(interaction.guild.id);
      const nowPlaying = musicPlayer.getNowPlaying(interaction.guild.id);
      
      // Kuyruk boş mu kontrol et
      if (!queue || queue.length === 0) {
        if (!nowPlaying) {
          return interaction.reply({ content: "❌ Şu anda çalan bir şarkı veya kuyrukta bekleyen şarkı yok." });
        }
        
        // Sadece şu anda çalınan şarkı varsa
        const embed = new EmbedBuilder()
          .setTitle("🎵 Şimdi Çalınıyor")
          .setDescription(`[${nowPlaying.title}](${nowPlaying.url})`)
          .setThumbnail(nowPlaying.thumbnail)
          .addFields(
            { name: 'Ekleyen', value: `<@${nowPlaying.requestedBy}>`, inline: true },
            { name: 'Süre', value: musicPlayer.formatDuration(nowPlaying.duration), inline: true }
          )
          .setColor('#3498db')
          .setFooter({ text: 'Kuyrukta başka şarkı bulunmuyor.' });
        
        return interaction.reply({ embeds: [embed] });
      }
      
      // Sayfa başına gösterilecek şarkı sayısı
      const itemsPerPage = 10;
      // Toplam sayfa sayısı
      const totalPages = Math.ceil(queue.length / itemsPerPage);
      // Sayfa numarası (varsayılan: 1)
      const page = 1;
      
      // Kuyruk öğelerini formatlama
      const queueString = queue
        .slice((page - 1) * itemsPerPage, page * itemsPerPage)
        .map((track, index) => {
          const position = (page - 1) * itemsPerPage + index + 1;
          return `**${position}.** [${track.title}](${track.url}) | \`${musicPlayer.formatDuration(track.duration)}\` | <@${track.requestedBy}>`;
        })
        .join("\n");
      
      // Toplam süreyi hesapla
      const totalDuration = queue.reduce((acc, track) => acc + (track.duration || 0), 0);
      
      // Embed oluştur
      const embed = new EmbedBuilder()
        .setTitle(`📋 ${interaction.guild.name} Müzik Kuyruğu`)
        .setDescription(
          `${nowPlaying ? 
            `**Şimdi Çalınıyor:**\n[${nowPlaying.title}](${nowPlaying.url}) | \`${musicPlayer.formatDuration(nowPlaying.duration)}\` | <@${nowPlaying.requestedBy}>\n\n` : 
            ''}` +
          `**Kuyruk:**\n${queueString || 'Kuyruk boş!'}`
        )
        .addFields(
          { name: 'Şarkı Sayısı', value: `${queue.length}`, inline: true },
          { name: 'Toplam Süre', value: musicPlayer.formatDuration(totalDuration), inline: true },
          { name: 'Sayfa', value: `${page}/${totalPages}`, inline: true }
        )
        .setColor('#3498db')
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }));
      
      // Sayfalama butonları (sadece bir sayfadan fazla varsa)
      const row = new ActionRowBuilder();
      
      if (totalPages > 1) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`queue_prev_${interaction.user.id}`)
            .setLabel('Önceki')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 1),
          
          new ButtonBuilder()
            .setCustomId(`queue_next_${interaction.user.id}`)
            .setLabel('Sonraki')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === totalPages)
        );
        
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`queue_refresh_${interaction.user.id}`)
            .setEmoji('🔄')
            .setStyle(ButtonStyle.Primary)
        );
      }
      
      // Shuffle ve skip butonları
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`queue_shuffle_${interaction.user.id}`)
          .setEmoji('🔀')
          .setStyle(ButtonStyle.Success),
        
        new ButtonBuilder()
          .setCustomId(`queue_skip_${interaction.user.id}`)
          .setEmoji('⏭️')
          .setStyle(ButtonStyle.Danger)
      );
      
      // Sayfayı ve sayfa bilgilerini sakla
      client.queuePages = client.queuePages || {};
      client.queuePages[interaction.user.id] = {
        page,
        totalPages,
        guildId: interaction.guild.id,
        timestamp: Date.now()
      };
      
      // Cevap gönder
      const components = row.components.length > 0 ? [row] : [];
      await interaction.reply({ embeds: [embed], components });
      
      // 5 dakika sonra butonları devre dışı bırak
      setTimeout(() => {
        if (client.queuePages[interaction.user.id] && 
            client.queuePages[interaction.user.id].timestamp === Date.now()) {
          delete client.queuePages[interaction.user.id];
          interaction.editReply({ components: [] }).catch(() => {});
        }
      }, 300000); // 5 dakika
      
    } catch (error) {
      console.error('Kuyruk görüntüleme hatası:', error);
      await interaction.reply({ 
        content: `❌ Kuyruk görüntülenirken bir hata oluştu: ${error.message}`, 
        ephemeral: true 
      });
    }
  }
}; 