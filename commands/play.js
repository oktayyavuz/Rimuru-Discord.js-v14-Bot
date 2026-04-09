const { 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  ApplicationCommandOptionType 
} = require('discord.js');
const musicPlayer = require('../helpers/music/MusicPlayer');

module.exports = {
  name: "play",
  description: "şarkı çalar",
  type: 1,
  options: [
    {
      name: "şarkı",
      description: "Çalmak istediğiniz şarkı adı veya URL",
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],

  run: async(client, interaction) => {
    const query = interaction.options.getString("şarkı");
    
    try {
      await interaction.deferReply();
      
      // Ses kanalına katılma
      const joined = await musicPlayer.join(interaction);
      if (!joined) return;
      
      // URL mi yoksa arama sorgusu mu?
      let track;
      const isUrl = query.match(/^https?:\/\//);
      
      if (isUrl) {
        // URL'den şarkı bilgilerini al
        try {
          track = await musicPlayer.getTrackInfo(query);
          track.requestedBy = interaction.user.id;
          
          // Kuyruğa ekle
          const position = musicPlayer.addToQueue(interaction.guild.id, track);
          
          const embed = new EmbedBuilder()
            .setTitle('Kuyruğa Eklendi')
            .setDescription(`[${track.title}](${track.url})`)
            .setThumbnail(track.thumbnail)
            .addFields(
              { name: 'Pozisyon', value: `${position + 1}`, inline: true },
              { name: 'Ekleyen', value: `<@${interaction.user.id}>`, inline: true },
              { name: 'Süre', value: musicPlayer.formatDuration(track.duration), inline: true }
            )
            .setColor('#3498db')
            .setTimestamp();
          
          await interaction.editReply({ embeds: [embed] });
          
          // Şu anda çalan şarkı yoksa çalmaya başla
          const player = musicPlayer.players.get(interaction.guild.id);
          if (player.state.status !== 'playing') {
            musicPlayer.play(interaction.guild.id, interaction.channel);
          }
        } catch (error) {
          await interaction.editReply({ content: `❌ URL'den şarkı bilgisi alınamadı: ${error.message}` });
        }
      } else {
        // İsimle arama yap
        const results = await musicPlayer.search(query, 5);
        
        if (!results || results.length === 0) {
          return interaction.editReply({ content: `❌ "${query}" için şarkı bulunamadı. Farklı bir arama deneyin.` });
        }
        
        if (results.length === 1) {
          // Sadece bir sonuç varsa otomatik ekle
          track = results[0];
          track.requestedBy = interaction.user.id;
          
          // Kuyruğa ekle
          const position = musicPlayer.addToQueue(interaction.guild.id, track);
          
          const embed = new EmbedBuilder()
            .setTitle('Kuyruğa Eklendi')
            .setDescription(`[${track.title}](${track.url})`)
            .setThumbnail(track.thumbnail)
            .addFields(
              { name: 'Pozisyon', value: `${position + 1}`, inline: true },
              { name: 'Ekleyen', value: `<@${interaction.user.id}>`, inline: true },
              { name: 'Süre', value: musicPlayer.formatDuration(track.duration), inline: true }
            )
            .setColor('#3498db')
            .setTimestamp();
          
          await interaction.editReply({ embeds: [embed] });
          
          // Şu anda çalan şarkı yoksa çalmaya başla
          const player = musicPlayer.players.get(interaction.guild.id);
          if (player.state.status !== 'playing') {
            musicPlayer.play(interaction.guild.id, interaction.channel);
          }
        } else {
          // Birden fazla sonuç varsa seçim yaptır
          const resultsEmbed = new EmbedBuilder()
            .setTitle('Arama Sonuçları')
            .setDescription(`"${query}" araması için sonuçlar.\nLütfen 1 dakika içinde bir şarkı seçin:`)
            .setColor('#3498db');
          
          results.forEach((result, index) => {
            resultsEmbed.addFields({
              name: `${index + 1}. ${result.title}`,
              value: `**Süre:** ${musicPlayer.formatDuration(result.duration)}\n**Kanal:** ${result.channel}`
            });
          });
          
          // Seçim butonları
          const row = new ActionRowBuilder();
          
          for (let i = 0; i < results.length; i++) {
            row.addComponents(
              new ButtonBuilder()
                .setCustomId(`select_${i}_${interaction.user.id}`)
                .setLabel(`${i + 1}`)
                .setStyle(ButtonStyle.Primary)
            );
          }
          
          // İptal butonu
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(`cancel_${interaction.user.id}`)
              .setLabel('İptal')
              .setStyle(ButtonStyle.Danger)
          );
          
          await interaction.editReply({ embeds: [resultsEmbed], components: [row] });
          
          // Verileri sakla
          client.searchResults = client.searchResults || {};
          client.searchResults[interaction.user.id] = {
            results,
            guild: interaction.guild.id,
            channel: interaction.channel
          };
          
          // 1 dk sonra butonları devre dışı bırak
          setTimeout(() => {
            if (client.searchResults[interaction.user.id]) {
              delete client.searchResults[interaction.user.id];
              interaction.editReply({ components: [] }).catch(() => {});
            }
          }, 60000);
        }
      }
    } catch (error) {
      console.error('Şarkı çalma hatası:', error);
      await interaction.editReply({ content: `❌ Şarkı oynatılırken bir hata oluştu: ${error.message}` });
    }
  }
}; 