const { Client, EmbedBuilder, ButtonBuilder, ActionRow } = require("discord.js");
const Discord = require("discord.js")
module.exports = {
  name: "davet",
  description: " Botun davet linkini atar.",
  type: 1,
  options: [],

  run: async(client, interaction) => {

    const dvt = new Discord.ButtonBuilder().setLabel('Davet Linkim').setStyle('Link').setEmoji('🤖').setURL('https://discord.com/oauth2/authorize?client_id=1229312139517235281&permissions=8&scope=bot+applications.commands');
	const destek = new Discord.ButtonBuilder().setLabel('Destek Sunucum').setStyle('Link').setEmoji('🌎').setURL('https://discord.gg/mondstadt');
    const row = new Discord.ActionRowBuilder().addComponents(dvt).addComponents(destek)
    const embed = new EmbedBuilder()
    .setAuthor({ name: "Merhaba, Ben Rimuru!", iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })})
.setTitle("Rimuru'yu Davet Et!")
.setDescription(`🤖 | Botu çağıdığın için eyw`)
.setColor('#2F3136')
.setTimestamp()
.setFooter({text: interaction.user.tag+" İstedi.", iconURL: interaction.user.displayAvatarURL({ dynamic: true })})

interaction.reply({ embeds: [embed], components:[row]});
  }  

};