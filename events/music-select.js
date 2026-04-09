const { EmbedBuilder } = require("discord.js");
const musicPlayer = require('../helpers/music/MusicPlayer');

module.exports = {
  name: "interactionCreate",
  run: async (client, interaction) => {
    if (!interaction.isButton()) return;
    
    // Arama seçim butonlarını kontrol et
    if (interaction.customId.startsWith("select_") || interaction.customId.startsWith("cancel_")) {
      // Kullanıcı ID'sini al
      const userId = interaction.customId.split("_").pop();
      
      // İşlemi sadece doğru kullanıcıya izin ver
      if (userId !== interaction.user.id) {
        return interaction.reply({ 
          content: "❌ Bu buton sizin için değil!", 
          ephemeral: true 
        });
      }
      
      // Saklanan sonuçları kontrol et
      const searchData = client.searchResults?.[userId];
      if (!searchData) {
        return interaction.reply({
          content: "❌ Arama sonuçları süresi dolmuş veya bulunamıyor. Lütfen yeni bir arama yapın.",
          ephemeral: true
        });
      }
      
      // İptal seçeneği
      if (interaction.customId.startsWith("cancel_")) {
        await interaction.update({ 
          content: "🚫 Müzik araması iptal edildi.", 
          embeds: [], 
          components: [] 
        });
        delete client.searchResults[userId];
        return;
      }
      
      // Seçilen şarkı indeksini al
      const selected = parseInt(interaction.customId.split("_")[1]);
      const track = searchData.results[selected];
      
      // Seçilen şarkıyı ekleyen kişiyi kaydet
      track.requestedBy = userId;
      
      // Kuyruğa ekle
      const position = musicPlayer.addToQueue(searchData.guild, track);
      
      // Arayüzü güncelle
      const embed = new EmbedBuilder()
        .setTitle('Kuyruğa Eklendi')
        .setDescription(`[${track.title}](${track.url})`)
        .setThumbnail(track.thumbnail)
        .addFields(
          { name: 'Pozisyon', value: `${position + 1}`, inline: true },
          { name: 'Ekleyen', value: `<@${userId}>`, inline: true },
          { name: 'Süre', value: musicPlayer.formatDuration(track.duration), inline: true }
        )
        .setColor('#3498db')
        .setTimestamp();
      
      await interaction.update({ 
        content: null,
        embeds: [embed], 
        components: [] 
      });
      
      // Aramayı temizle
      delete client.searchResults[userId];
      
      // Şu anda çalan şarkı yoksa çalmaya başla
      const player = musicPlayer.players.get(searchData.guild);
      if (player && player.state.status !== 'playing') {
        musicPlayer.play(searchData.guild, searchData.channel);
      }
    }
  }
}; 