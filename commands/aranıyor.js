const { Client, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
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

      const avatarPngBuffer = await sharp(avatarBuffer).png().toBuffer();

      const canvas = Canvas.createCanvas(500, 676);
      const context = canvas.getContext('2d');
      const background = await Canvas.loadImage('https://i.hizliresim.com/2tj1nu4.jpg');
      const avatar = await Canvas.loadImage(avatarPngBuffer);

      context.drawImage(background, 0, 0, canvas.width, canvas.height);

      const avatarWidth = 406;
      const avatarHeight = 290;
      const avatarX = (canvas.width - avatarWidth) / 2;
      const avatarY = 218;

      context.drawImage(avatar, avatarX, avatarY, avatarWidth, avatarHeight);

      const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'aranıyor-poster.png' });

      interaction.reply({ files: [attachment] });
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.', ephemeral: true });
    }
  }
};