const { PermissionsBitField } = require("discord.js");
const db = require("croxydb")
const { EmbedBuilder } = require("discord.js");
module.exports = {
    name:"medya-kanalı",
    description: ' Görsel engel sistemini ayarlarsın!',
    type:1,
    options: [
        {
            name: "kanal",
            description: "Görsel engel kanalını ayarlarsın!",
            type: 7,
            required: true,
            channel_types: [0]
        },
       
    ],
  run: async(client, interaction) => {

    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({content: "❌ | Kanalları Yönet Yetkin Yok!", ephemeral: true})
    const kanal2 = interaction.options.getChannel('kanal')
   db.set(`görselengel_${interaction.guild.id}`, kanal2.id);

   const embed = new EmbedBuilder()
     .setColor("Random")
     .setDescription(`✅ | <#${kanal2.id}> kanalında sadece gif ve resimlere izin vereceğim!`);
   
   interaction.reply({ embeds: [embed] });
   },
};