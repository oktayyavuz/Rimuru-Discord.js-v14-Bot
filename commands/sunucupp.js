const { Client, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder } = require("discord.js");
module.exports = {
    name:"sunucupp",
    description: ' Sunucunun avatarına bakarsın!',
    type:1,
    options:[],
      
  run: async(client, interaction) => {

        interaction.reply({
            embeds:[
                {
                    title: `${interaction.guild.name} adlı sunucunun avatarı:`,
                    description: `[Link](${interaction.guild.iconURL({ dynamic: true })})`,
                    image: {url: interaction.guild.iconURL({ dynamic: true })}
                }
            ],
            
        })
}

};
