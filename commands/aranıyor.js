const { Client, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const sharp = require('sharp');
const axios = require('axios');

module.exports = {
  name: 'aranıyor',
  description: 'Etiketlenen kişi için arama posteri oluşturur.',
  type: 1,
  options: [
    {
      name: 'kişi',
      description: 'Arama posteri yapılacak kişi.',
      type: 6,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    const user = interaction.options.getUser('kişi');
    const avatarURL = user.displayAvatarURL({ format: 'png', size: 256, dynamic: false });

    if (!avatarURL) {
      const embed = new EmbedBuilder()
        .setTitle('Hata')
        .setDescription('Bu kullanıcının avatarı yok.')
        .setColor('#FF0000');

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    try {
      const response = await axios.get(avatarURL, { responseType: 'arraybuffer' });
      const avatarBuffer = Buffer.from(response.data, 'binary');

      const backgroundUrl = 'https://i.imgur.com/ahLvKvk.jpeg'; 
      const backgroundResponse = await axios.get(backgroundUrl, { responseType: 'arraybuffer' });
      const backgroundBuffer = Buffer.from(backgroundResponse.data, 'binary');

      const compositeImage = await sharp(backgroundBuffer)
        .composite([
          {
            input: avatarBuffer,
            top: 218,
            left: (500 - 406) / 2,
          },
        ])
        .png()
        .toBuffer();

      const attachment = new AttachmentBuilder(compositeImage, { name: 'aranıyor-poster.png' });

      interaction.reply({ files: [attachment] });
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.', ephemeral: true });
    }
  },
};
