const { Client, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'emojiçek',
  description: 'Belirtilen sunucudaki tüm emojileri bu sunucuya ekler.',
  type: 1,
  options: [
    {
      name: 'sunucuid',
      description: 'Emoji çekilecek sunucunun ID\'si.',
      type: 3,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    const sourceServerId = interaction.options.getString('sunucuid');
    const targetServer = interaction.guild;
    const delay = 3000; 

    let initialMessage;

    try {
      const sourceServer = await client.guilds.fetch(sourceServerId);
      const emojis = await sourceServer.emojis.fetch();
      const targetEmojis = await targetServer.emojis.fetch();

      const startEmbed = new EmbedBuilder()
        .setTitle('Emoji Çekme Başladı')
        .setDescription(`"${sourceServer.name}" sunucusundan emojiler çekiliyor...`)
        .setImage("https://i.hizliresim.com/t7avr37.gif")
        .setColor('Yellow');

      initialMessage = await interaction.reply({ embeds: [startEmbed], fetchReply: true });

      for (const emoji of emojis.values()) {
        const emojiUrl = emoji.url || emoji.imageURL();  
        const emojiName = emoji.name;

        console.log(`İşleniyor: ${emojiName}`);

        if (targetEmojis.some(e => e.name === emojiName)) {
          console.log(`Emoji ${emojiName} zaten mevcut, atlanıyor.`);
          continue;
        }

        try {
          await new Promise(resolve => setTimeout(resolve, delay)); 
          await targetServer.emojis.create({
            attachment: emojiUrl,
            name: emojiName,
          });
          console.log(`Emoji ${emojiName} başarıyla eklendi.`);
        } catch (error) {
          console.error(`Emoji ${emojiName} eklenirken bir hata oluştu:`, error);
          await interaction.followUp({ content: `Emoji ${emojiName} eklenirken bir hata oluştu: ${error.message}`, ephemeral: true });
          continue;
        }
      }

      const completeEmbed = new EmbedBuilder()
        .setTitle('Emoji Çekme Tamamlandı')
        .setDescription(`Başarıyla "${sourceServer.name}" sunucusundan emojiler çekildi ve bu sunucuya eklendi!`)
        .setImage("https://i.hizliresim.com/t7avr37.gif")
        .setColor('Green')
        .setFooter({
          text: `Kullanıldığı zaman: ${new Date().toLocaleString()}`,
          iconURL: interaction.guild.iconURL({ dynamic: true, size: 16 })
        });

      await initialMessage.delete();
      interaction.followUp({ embeds: [completeEmbed] });

    } catch (error) {
      console.error('Bir hata oluştu:', error);
      if (initialMessage) {
        await initialMessage.delete();
      }
      interaction.reply({ content: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.', ephemeral: true });
    }
  }
};
