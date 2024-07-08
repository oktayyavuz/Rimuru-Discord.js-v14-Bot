const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb")
const Discord = require("discord.js")
module.exports = {
  name: "oylama",
  description: " Oylama Yaparsın!",
  type: 1,
  options: [
    {
        name:"yazı",
        description:"Oylama Seçeneğini Gir!",
        type:3,
        required:true
    },
  ],

  run: async(client, interaction) => {
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) return interaction.reply({content: "❌ | Yetkin Yok!", ephemeral: true})

    const yazı = interaction.options.getString('yazı')

    const row = new Discord.ActionRowBuilder()
    .addComponents(
    new Discord.ButtonBuilder()
    .setStyle("Success")
    .setLabel("(0) Evet")
    .setEmoji("922176863911149660")
    .setCustomId("evetoylama_everyone"),
    new Discord.ButtonBuilder()
    .setStyle("Danger")
    .setLabel("(0) Hayır")
    .setEmoji("922176863881797693")
    .setCustomId("hayıroylama_everyone"))
    
    const embed = new EmbedBuilder()
    .setTitle("Oylama!")
    .setDescription("##"+  yazı)
    .addFields({ name: 'Evet Oy ver', value: `> Evet oyu vermek için **Evet** butonuna tıklayın.`, inline: false})
    .addFields({ name: 'Hayır Oy ver', value: `> Hayır oyu vermek için **Hayır** butonuna tıklayın.`, inline: false})
    .setImage("https://c.tenor.com/4BZURP8cynMAAAAC/demon-lord-rimuru.gif")
    .setColor("Random")
    
    interaction.reply({embeds: [embed], components: [row] })

  }

};
