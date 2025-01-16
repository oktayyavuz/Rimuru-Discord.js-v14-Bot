const { Client, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const cooldowns = new Map(); 
const COOLDOWN_TIME = 7000; 

module.exports = {
  name: 'random-anime',
  description: 'Rastgele bir anime önerir.',
  type: 1,
  options: [],

  run: async (client, interaction) => {
    const userId = interaction.user.id;

    if (cooldowns.has(userId)) {
      const expirationTime = cooldowns.get(userId) + COOLDOWN_TIME;
      const now = Date.now();

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return interaction.reply({ content: `Lütfen ${timeLeft.toFixed(1)} saniye bekleyin ve tekrar deneyin.`, ephemeral: true });
      }
    }

    cooldowns.set(userId, Date.now());

    try {
      const query = `
        query {
          Page(page: ${Math.floor(Math.random() * 100) + 1}, perPage: 1) {
            media(type: ANIME sort: POPULARITY_DESC) {
              title {
                romaji
              }
              coverImage {
                large
              }
            }
          }
        }
      `;

      const response = await axios.post('https://graphql.anilist.co', { query });
      const anime = response.data.data.Page.media[0];

      const embed = new EmbedBuilder()
        .setTitle('Random Anime Önerisi:')
        .setDescription(`**${anime.title.romaji}**`)
        .setColor('Random')
        .setImage(anime.coverImage.large)
        .setFooter({
          text: `Kullanıldığı zaman: ${new Date().toLocaleString()}`,
          iconURL: interaction.guild.iconURL({ dynamic: true, size: 16 })
        });

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.', ephemeral: true });
    }
  }
};
