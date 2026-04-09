const { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource, 
  AudioPlayerStatus, 
  VoiceConnectionStatus 
} = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');
const play = require('play-dl');
const db = require('croxydb');

class MusicPlayer {
  constructor() {
    this.queues = new Map(); // sunucu ID'sine göre kuyrukları sakla
    this.players = new Map(); // her sunucu için ses oynatıcısı
    this.connections = new Map(); // her sunucu için ses bağlantısı
  }

  // Kuyruk oluşturma veya var olan kuyruğu alma
  getQueue(guildId) {
    if (!this.queues.has(guildId)) {
      this.queues.set(guildId, []);
    }
    return this.queues.get(guildId);
  }

  // Şarkıyı kuyruğa ekleme
  addToQueue(guildId, track) {
    const queue = this.getQueue(guildId);
    queue.push(track);
    return queue.length - 1; // kuyruk pozisyonu
  }

  // Kuyruktan şarkı çıkarma
  removeFromQueue(guildId, index) {
    const queue = this.getQueue(guildId);
    if (index >= 0 && index < queue.length) {
      return queue.splice(index, 1)[0];
    }
    return null;
  }

  // Ses kanalına katılma
  async join(interaction) {
    const { member, guild, channel } = interaction;
    
    // Kullanıcı ses kanalında mı kontrol et
    if (!member.voice.channel) {
      await interaction.reply({ content: '❌ Bir ses kanalında olmalısın!', ephemeral: true });
      return false;
    }
    
    // Bot zaten ses kanalında mı kontrol et
    const botVoiceChannel = guild.members.me.voice.channel;
    if (botVoiceChannel && botVoiceChannel.id !== member.voice.channel.id) {
      await interaction.reply({ 
        content: `❌ Şu anda ${botVoiceChannel.name} kanalındayım. Önce beni durdurun veya aynı kanala katılın.`, 
        ephemeral: true 
      });
      return false;
    }
    
    try {
      // Ses kanalına katıl
      const connection = joinVoiceChannel({
        channelId: member.voice.channel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: true,
        selfMute: false
      });
      
      // Ses oynatıcısı oluştur
      const player = createAudioPlayer();
      connection.subscribe(player);
      
      // İlgili olayları dinle
      connection.on(VoiceConnectionStatus.Disconnected, async () => {
        try {
          await Promise.race([
            new Promise(resolve => connection.once(VoiceConnectionStatus.Ready, resolve)),
            new Promise((_, reject) => setTimeout(reject, 5000))
          ]);
        } catch (error) {
          this.leave(guild.id);
        }
      });
      
      // Oynatıcı olayları
      player.on(AudioPlayerStatus.Idle, () => {
        this.playNext(guild.id, channel);
      });
      
      player.on('error', error => {
        console.error(`Oynatıcı hatası: ${error.message}`);
        channel.send({ content: `❌ Müzik çalarken bir hata oluştu: ${error.message}` });
        this.playNext(guild.id, channel);
      });
      
      // Verileri kaydet
      this.connections.set(guild.id, connection);
      this.players.set(guild.id, player);
      
      return true;
    } catch (error) {
      console.error(`Ses kanalına katılma hatası: ${error.message}`);
      await interaction.reply({ content: `❌ Ses kanalına katılırken bir hata oluştu: ${error.message}`, ephemeral: true });
      return false;
    }
  }
  
  // Ses kanalından ayrılma
  leave(guildId) {
    const connection = this.connections.get(guildId);
    if (connection) {
      connection.destroy();
      this.connections.delete(guildId);
    }
    
    const player = this.players.get(guildId);
    if (player) {
      player.stop();
      this.players.delete(guildId);
    }
    
    this.queues.delete(guildId);
  }
  
  // Şarkı çalma
  async play(guildId, channel) {
    const queue = this.getQueue(guildId);
    const player = this.players.get(guildId);
    
    if (!queue.length || !player) return false;
    
    const track = queue[0]; // kuyruktan ilk parçayı al
    
    try {
      let stream;
      
      // YouTube URL'si kontrolü
      if (track.url.includes('youtube.com') || track.url.includes('youtu.be')) {
        // Play-dl ile ses akışı oluştur
        const yt_info = await play.video_info(track.url);
        stream = await play.stream_from_info(yt_info);
      } 
      // Spotify URL'si kontrolü
      else if (track.url.includes('spotify.com')) {
        // Spotify parçalarını YouTube'da ara
        const searched = await play.search(`${track.title} ${track.artist || ''}`, { limit: 1 });
        if (!searched || !searched.length) throw new Error('Şarkı bulunamadı');
        
        const yt_info = await play.video_info(searched[0].url);
        stream = await play.stream_from_info(yt_info);
        
        // Bilgileri güncelle
        track.thumbnail = searched[0].thumbnails[0].url;
        track.duration = searched[0].durationInSec;
      }
      // Diğer URL'ler için (ileride SoundCloud vb. eklenebilir)
      else {
        throw new Error('Desteklenmeyen URL formatı');
      }
      
      // Ses kaynağı oluştur
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type,
        inlineVolume: true
      });
      
      resource.volume.setVolume(0.5); // varsayılan ses düzeyi
      
      // Oynatmaya başla
      player.play(resource);
      
      // Şimdi çalınan şarkı embed'i gönder
      const embed = new EmbedBuilder()
        .setTitle('🎵 Şimdi Çalınıyor')
        .setDescription(`[${track.title}](${track.url})`)
        .setThumbnail(track.thumbnail)
        .addFields(
          { name: 'Ekleyen', value: `<@${track.requestedBy}>`, inline: true },
          { name: 'Süre', value: this.formatDuration(track.duration), inline: true }
        )
        .setColor('#3498db')
        .setTimestamp();
      
      channel.send({ embeds: [embed] });
      
      // Şimdi çalınanı DB'ye kaydet
      db.set(`nowPlaying_${guildId}`, track);
      
      return true;
    } catch (error) {
      console.error(`Şarkı çalma hatası: ${error.message}`);
      channel.send({ content: `❌ "${track.title}" şarkısı çalınırken bir hata oluştu: ${error.message}` });
      
      // Hatalı şarkıyı kuyruktan çıkar ve bir sonrakine geç
      queue.shift();
      return this.play(guildId, channel);
    }
  }
  
  // Sonraki şarkıyı çal
  async playNext(guildId, channel) {
    const queue = this.getQueue(guildId);
    
    if (!queue.length) {
      channel.send({ content: '📭 Kuyrukta başka şarkı kalmadı. Ses kanalından ayrılıyorum.' });
      this.leave(guildId);
      // Şimdi çalınanı temizle
      db.delete(`nowPlaying_${guildId}`);
      return;
    }
    
    // Şu anki şarkıyı kuyruktan çıkar
    queue.shift();
    
    // Kuyruk boşaldıysa
    if (queue.length === 0) {
      channel.send({ content: '📭 Kuyrukta başka şarkı kalmadı. Ses kanalından ayrılıyorum.' });
      this.leave(guildId);
      // Şimdi çalınanı temizle
      db.delete(`nowPlaying_${guildId}`);
      return;
    }
    
    // Sonraki şarkıyı çal
    this.play(guildId, channel);
  }
  
  // Şarkı araması yapma
  async search(query, limit = 5) {
    try {
      // play-dl ile YouTube'da ara
      const results = await play.search(query, { limit });
      
      return results.map(video => ({
        title: video.title,
        url: video.url,
        thumbnail: video.thumbnails[0].url,
        duration: video.durationInSec,
        views: video.views,
        channel: video.channel.name
      }));
    } catch (error) {
      console.error(`Arama hatası: ${error.message}`);
      return [];
    }
  }
  
  // Şarkı url'sinden bilgi alma
  async getTrackInfo(url) {
    try {
      // YouTube URL'si için
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const info = await play.video_info(url);
        const video = info.video_details;
        
        return {
          title: video.title,
          url: video.url,
          thumbnail: video.thumbnails[0].url,
          duration: video.durationInSec,
          views: video.views,
          channel: video.channel.name
        };
      }
      // Spotify URL'si için
      else if (url.includes('spotify.com')) {
        const info = await play.spotify(url);
        
        return {
          title: info.name,
          url: url,
          thumbnail: info.thumbnail?.url || '',
          duration: Math.floor(info.durationInSec),
          artist: info.artists.map(a => a.name).join(', ')
        };
      }
      
      throw new Error('Desteklenmeyen URL formatı');
    } catch (error) {
      console.error(`Şarkı bilgisi alma hatası: ${error.message}`);
      throw error;
    }
  }
  
  // Süre formatını düzenleme
  formatDuration(seconds) {
    if (!seconds) return 'Bilinmiyor';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }
  
  // Kuyruğu karıştırma
  shuffle(guildId) {
    const queue = this.getQueue(guildId);
    if (queue.length <= 1) return queue;
    
    // İlk şarkıyı (çalan şarkı) koru, diğerlerini karıştır
    const firstTrack = queue.shift();
    
    // Fisher-Yates karıştırma algoritması
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    
    // İlk şarkıyı geri ekle
    queue.unshift(firstTrack);
    
    return queue;
  }
  
  // Şimdi çalınanı al
  getNowPlaying(guildId) {
    return db.get(`nowPlaying_${guildId}`);
  }
  
  // Ses seviyesini ayarlama
  setVolume(guildId, volume) {
    const player = this.players.get(guildId);
    if (player && player.state.resource) {
      const vol = Math.max(0, Math.min(1, volume / 100)); // 0-100 aralığını 0-1 aralığına dönüştür
      player.state.resource.volume.setVolume(vol);
      return true;
    }
    return false;
  }
}

// Tek bir global örnek oluştur
const musicPlayer = new MusicPlayer();
module.exports = musicPlayer;