const { Client, EmbedBuilder } = require("discord.js");
const Discord = require("discord.js")

module.exports = {
    name:"kullanıcı-bilgi",
    description: ' Kullanıcı bilgisine bakarsın.',
    type:1,
    options: [
      {
        name:"kullanıcı",
        description:"Bilgisine bakmak istediğin kullanıcı etiketle!",
        type:6,
        required:true
    },
  
],
run: async(client, interaction) => {

const member = interaction.options.getMember('kullanıcı')

    const embed = new EmbedBuilder()
    .setDescription(`**➥ Kullanıcı Bilgileri**
            
    • Kullanıcı: (<@${member.user.id}> - \`${member.user.id}\`)
    • Hesap Kurulum Tarihi: <t:${parseInt(member.user.createdTimestamp  / 1000)}:R>
    • Sunucuya Katılma Tarihi: <t:${parseInt(member.joinedTimestamp / 1000)}:R>
    `)
    .setThumbnail(`${member.user.displayAvatarURL()}`)
    .setColor("Random")
interaction.reply({embeds: [embed]})
  }  

};