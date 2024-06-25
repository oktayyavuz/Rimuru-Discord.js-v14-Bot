const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const Discord = require("discord.js")
const db = require("croxydb")
const config = require("../config.json")
module.exports = {
  name: "buton-rol",
  description: " Rol alma sistemini ayarlarsın!",
  type: 1,
  options: [
    {
        name:"rol",
        description:"Lütfen bir rol etiketle!",
        type:8,
        required:true
    },
    {
      name:"yazı",
      description:"Lütfen bir embed mesaj yazısı gir!",
      type:3,
      required:true
  },
   
   
],

  run: async(client, interaction) => {
 
 if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return interaction.reply({content: "❌ | Rolleri Yönet Yetkin Yok!", ephemeral: true})
  
 const rol = interaction.options.getRole('rol')
 const yazı = interaction.options.getString('yazı')

 let buttonid = rol.name
 const embed = new EmbedBuilder()
 .setTitle(`${config["bot-adi"]} - Buton Rol Al Sistemi!`)
 .setDescription(`${yazı}`)
.setImage("https://i.hizliresim.com/8a09g00.gif")
 .setColor("#ff0000")
 const row = new Discord.ActionRowBuilder()
 .addComponents(
 new Discord.ButtonBuilder()
 .setLabel(rol.name)
 .setStyle(Discord.ButtonStyle.Primary)
 .setCustomId("rol_everyone")
 )
 interaction.reply({embeds: [embed], components: [row]}).then((mesaj) => {
db.set(`buton_rol${interaction.guild.id}`, rol.id)
})
 

  }

};
