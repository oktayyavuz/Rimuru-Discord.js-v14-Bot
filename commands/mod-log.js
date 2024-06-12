const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb")
module.exports = {
    name:"mod-log",
    description: ' Moderasyon kanalını ayarlarsın!',
    type:1,
    options: [
        {
            name: "kanal",
            description: "Mod logunu ayarlarsın!",
            type: 7,
            required: true,
            channel_types: [0]
        },
       
    ],
  run: async(client, interaction) => {

    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({content: "❌ | Kanalları Yönet Yetkin Yok!", ephemeral: true})
    const kanal2 = interaction.options.getChannel('kanal')
    db.set(`modlogK_${interaction.guild.id}`, kanal2.id);

   const embed = new EmbedBuilder()
     .setColor("Random")
     .setDescription(`✅ | Moderasyon kanalı <#${kanal2.id}> olarak ayarlandı!`);
   
   interaction.reply({ embeds: [embed] });
   },
};
