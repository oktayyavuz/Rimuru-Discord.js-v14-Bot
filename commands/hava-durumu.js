const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const axios = require("axios");

module.exports = {
  name: "hava-durumu",
  description: "belirtilen şehrin hava durumunu gösterir",
  type: 1,
  options: [
    {
      name: "şehir",
      description: "Hava durumunu öğrenmek istediğiniz şehir adı",
      type: 3,
      required: true
    }
  ],

  run: async(client, interaction) => {
    const city = interaction.options.getString("şehir");
    
    try {
      await interaction.deferReply();
      
      // OpenWeatherMap API'sini kullanarak hava durumu verilerini çekelim
      const apiKey = "9c2b34aefc1acb7fdb4ccd22e9e36cd7"; // Ücretsiz API anahtarı
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=tr`);
      
      const weatherData = response.data;
      
      // Hava durumu bilgilerini alalım
      const temp = weatherData.main.temp;
      const tempFeelsLike = weatherData.main.feels_like;
      const humidity = weatherData.main.humidity;
      const pressure = weatherData.main.pressure;
      const windSpeed = weatherData.wind.speed;
      const weatherMain = weatherData.weather[0].main;
      const weatherDesc = weatherData.weather[0].description;
      const country = weatherData.sys.country;
      const cityName = weatherData.name;
      const weatherIcon = weatherData.weather[0].icon;
      
      // Hava durumu simgesi için URL
      const weatherIconUrl = `http://openweathermap.org/img/wn/${weatherIcon}@2x.png`;
      
      // Emoji seçimi
      let weatherEmoji = "❓";
      if (weatherMain === "Clear") weatherEmoji = "☀️";
      else if (weatherMain === "Clouds") weatherEmoji = "☁️";
      else if (weatherMain === "Rain") weatherEmoji = "🌧️";
      else if (weatherMain === "Snow") weatherEmoji = "❄️";
      else if (weatherMain === "Thunderstorm") weatherEmoji = "⛈️";
      else if (weatherMain === "Drizzle") weatherEmoji = "🌦️";
      else if (weatherMain === "Mist" || weatherMain === "Fog") weatherEmoji = "🌫️";
      
      // Embed mesajı oluştur
      const embed = new EmbedBuilder()
        .setColor("#3498db")
        .setTitle(`${cityName}, ${country} Hava Durumu ${weatherEmoji}`)
        .setThumbnail(weatherIconUrl)
        .addFields(
          { name: "Sıcaklık", value: `${temp.toFixed(1)}°C`, inline: true },
          { name: "Hissedilen", value: `${tempFeelsLike.toFixed(1)}°C`, inline: true },
          { name: "Durum", value: weatherDesc.charAt(0).toUpperCase() + weatherDesc.slice(1), inline: true },
          { name: "Nem", value: `${humidity}%`, inline: true },
          { name: "Basınç", value: `${pressure} hPa`, inline: true },
          { name: "Rüzgar Hızı", value: `${windSpeed} m/s`, inline: true }
        )
        .setFooter({ text: "Hava durumu bilgileri OpenWeatherMap tarafından sağlanmaktadır." })
        .setTimestamp();
      
      // Diğer günleri görme butonu
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`forecast_${city}`)
            .setLabel("5 Günlük Tahmin")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("📅")
        );
      
      await interaction.editReply({
        embeds: [embed],
        components: [row]
      });
      
    } catch (error) {
      console.error("Hava durumu hatası:", error);
      
      if (error.response && error.response.status === 404) {
        interaction.editReply({ content: `❌ **${city}** adında bir şehir bulunamadı. Lütfen geçerli bir şehir adı girin.` });
      } else {
        interaction.editReply({ content: "❌ Hava durumu bilgileri alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin." });
      }
    }
  }
}; 