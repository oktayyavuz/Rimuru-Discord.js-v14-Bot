const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "aşk-ölçer",
  description: "Belirtilen kişiler arasındaki aşk oranını hesaplar.",
  type: 1, 
  options: [
    {
      name: "kişi1",
      description: "İlk kişi",
      type: 6, 
      required: true
    },
    {
      name: "kişi2",
      description: "İkinci kişi",
      type: 6, 
      required: true
    }
  ],
  run: async (client, interaction) => {
    const user1 = interaction.options.getUser("kişi1");
    const user2 = interaction.options.getUser("kişi2");

    const lovePercentage = Math.floor(Math.random() * 101); 

    let loveLevel;
    let loveEmoji;
    let loveColor;

    if (lovePercentage < 25) {
      loveLevel = "Zayıf";
      loveEmoji = "💔";
      loveColor = "#ff0000";
    } else if (lovePercentage < 50) {
      loveLevel = "Orta";
      loveEmoji = "💖";
      loveColor = "#ffa500";
    } else if (lovePercentage < 75) {
      loveLevel = "Yüksek";
      loveEmoji = "💗";
      loveColor = "#00ff00";
    } else {
      loveLevel = "Aşırı Yüksek";
      loveEmoji = "💞";
      loveColor = "#ff00ff";
    }

    const embed = new EmbedBuilder()
      .setTitle("Aşk Ölçer")
      .setDescription(`**${user1.username}** ile **${user2.username}** arasındaki aşk oranı: **${lovePercentage}%** ${loveEmoji}\n\n${loveLevel} Seviye Aşk!`)
      .setColor(loveColor)
      .setImage("https://i.hizliresim.com/buqtroe.gif")
      .setFooter({ text: `Komutu kullanan: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }); 

    await interaction.reply({ embeds: [embed] });
  },
};
