const { EmbedBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
  name: "interactionCreate",
  run: async (client, interaction) => {
    if (!interaction.isButton()) return;
    
    // "forecast_" ile başlayan customId'leri dinle
    if (interaction.customId.startsWith("forecast_")) {
      // Şehir adını al
      const city = interaction.customId.replace("forecast_", "");
      
      try {
        await interaction.deferUpdate();
        
        // OpenWeatherMap API'sini kullanarak 5 günlük hava durumu verilerini çekelim
        const apiKey = "9c2b34aefc1acb7fdb4ccd22e9e36cd7"; // Ücretsiz API anahtarı
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=tr&cnt=40`);
        
        const forecastData = response.data;
        const cityName = forecastData.city.name;
        const country = forecastData.city.country;
        
        // Günlük tahminleri oluştur (her gün için 1 tahmin - öğle vakti)
        const dailyForecasts = [];
        const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
        
        // Bugünü atla, sonraki 5 gün için tahmin göster
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < forecastData.list.length; i++) {
          const forecast = forecastData.list[i];
          const forecastDate = new Date(forecast.dt * 1000);
          forecastDate.setHours(0, 0, 0, 0);
          
          // Bugünü atla ve öğle vakti tahminlerini al (her gün için 1 tahmin)
          if (forecastDate > today && forecast.dt_txt.includes("12:00:00")) {
            if (dailyForecasts.length < 5) { // En fazla 5 gün
              const dayName = days[forecastDate.getDay()];
              const dateStr = forecastDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
              
              // Emoji seçimi
              let weatherEmoji = "❓";
              const weatherMain = forecast.weather[0].main;
              if (weatherMain === "Clear") weatherEmoji = "☀️";
              else if (weatherMain === "Clouds") weatherEmoji = "☁️";
              else if (weatherMain === "Rain") weatherEmoji = "🌧️";
              else if (weatherMain === "Snow") weatherEmoji = "❄️";
              else if (weatherMain === "Thunderstorm") weatherEmoji = "⛈️";
              else if (weatherMain === "Drizzle") weatherEmoji = "🌦️";
              else if (weatherMain === "Mist" || weatherMain === "Fog") weatherEmoji = "🌫️";
              
              dailyForecasts.push({
                day: dayName,
                date: dateStr,
                temp: forecast.main.temp,
                weather: forecast.weather[0].description,
                icon: forecast.weather[0].icon,
                emoji: weatherEmoji
              });
            }
          }
        }
        
        // Tahmin bulunamazsa
        if (dailyForecasts.length === 0) {
          return interaction.editReply({ 
            content: "❌ 5 günlük tahmin verileri şu anda mevcut değil. Lütfen daha sonra tekrar deneyin.",
            components: [] 
          });
        }
        
        // Embed mesajı oluştur
        const embed = new EmbedBuilder()
          .setColor("#3498db")
          .setTitle(`${cityName}, ${country} 5 Günlük Hava Durumu Tahmini`)
          .setDescription("Aşağıda önümüzdeki 5 gün için öğle vakti tahminleri verilmiştir.")
          .setThumbnail(`http://openweathermap.org/img/wn/${dailyForecasts[0].icon}@2x.png`)
          .setFooter({ text: "Hava durumu bilgileri OpenWeatherMap tarafından sağlanmaktadır." })
          .setTimestamp();
        
        // Her gün için alan ekle
        dailyForecasts.forEach(forecast => {
          embed.addFields({
            name: `${forecast.day}, ${forecast.date} ${forecast.emoji}`,
            value: `**Sıcaklık:** ${forecast.temp.toFixed(1)}°C\n**Durum:** ${forecast.weather.charAt(0).toUpperCase() + forecast.weather.slice(1)}`,
            inline: true
          });
        });
        
        await interaction.editReply({
          embeds: [embed],
          components: []
        });
        
      } catch (error) {
        console.error("5 günlük hava durumu hatası:", error);
        await interaction.editReply({ 
          content: "❌ 5 günlük hava durumu bilgileri alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
          components: [] 
        });
      }
    }
  }
}; 