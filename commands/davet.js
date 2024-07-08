const { Client, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const config = require("../config.json");  

module.exports = {
  name: "davet",
  description: "Botun davet linkini atar.",
  type: 1,
  options: [],

  run: async(client, interaction) => {
    const dvt = new ButtonBuilder()
      .setLabel('Davet Linkim')
      .setStyle('Link')
      .setEmoji('🤖')
      .setURL(config["bot-davet"]);

    const destek = new ButtonBuilder()
      .setLabel('Destek Sunucum')
      .setStyle('Link')
      .setEmoji('🌎')
      .setURL(config["desteksunucusu"]);

    const row = new ActionRowBuilder().addComponents(dvt, destek);

    const embed = new EmbedBuilder()
      .setAuthor({ name: `Merhaba, Ben ${config["bot-adi"]}!`, iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
      .setTitle(`${config["bot-adi"]}'yu Davet Et!`)
      .setDescription(`🤖 | Botu çağırdığın için teşekkür ederim 😇`)
      .setImage("https://i.hizliresim.com/lpcfmca.gif")
      .setColor('#2F3136')
      .setTimestamp()
      .setFooter({ text: `${interaction.user.tag} İstedi.`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

    interaction.reply({ embeds: [embed], components: [row] });
  }  
};