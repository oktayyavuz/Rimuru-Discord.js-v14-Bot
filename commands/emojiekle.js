const { Client, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  name: 'emojiekle',
  description: 'Bir emoji veya resmi (statik veya GIF) sunucuya ekler.',
  type: 1,
  options: [
    {
      name: 'isim',
      description: 'Yeni emojinin ismi.',
      type: 3,
      required: true,
    },
    {
      name: 'emoji',
      description: 'Eklenecek emoji (URL veya emoji kodu).',
      type: 3,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    const emojiName = interaction.options.getString('isim');
    const emojiInput = interaction.options.getString('emoji');

    let emojiUrl;
    if (emojiInput.startsWith('http')) {
      emojiUrl = emojiInput;
    } else {
      const emojiCode = encodeURIComponent(emojiInput.split(':').pop().replace('>', ''));
      emojiUrl = `https://cdn.discordapp.com/emojis/${emojiCode}.${emojiInput.includes('<a:') ? 'gif' : 'png'}`;
    }

    try {
      const addedEmoji = await interaction.guild.emojis.create({
        attachment: emojiUrl,
        name: emojiName,
      });

      const embed = new EmbedBuilder()
        .setTitle('Emoji Ekleme Başarılı')
        .setDescription(`Başarıyla "${addedEmoji}" emojisi oluşturuldu!`)
        .setImage("https://i.hizliresim.com/od0qefy.gif")
        .setColor('Green')
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