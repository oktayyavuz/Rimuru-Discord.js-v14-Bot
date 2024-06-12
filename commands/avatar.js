const { Client, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder } = require("discord.js");
module.exports = {
    name:"avatar",
    description: ' Birinin Avatarına Bakarsın!',
    type:1,
    options: [
        {
            name:"kullanıcı",
            description:"Avatarına Bakmak İstediğin Kullanıcıyı Etiketle!",
            type:6,
            required:true
        },
      
    ],
  run: async(client, interaction) => {

    const member = interaction.options.getMember('kullanıcı')
   
          
    const row = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
        .setLabel(`PNG`)
        .setStyle(5)       .setURL(`${member.user.displayAvatarURL({size:1024,format:"png"})}`),
        
        new ButtonBuilder()
        .setLabel(`JPG`)
        .setStyle(5)       .setURL(`${member.user.displayAvatarURL({size:1024,format:"jpg"})}`),
        
        new ButtonBuilder()
        .setLabel(`WEBP`)
        .setStyle(5)       .setURL(`${member.user.displayAvatarURL({size:1024,format:"webp"})}`),
        
        new ButtonBuilder()
        .setLabel(`GIF`)
        .setStyle(5)       .setURL(`${member.user.displayAvatarURL({size:1024,format:"gif"})}`),
        )

        interaction.reply({
            embeds:[
                {
                    title: `${member.user.tag} avatarı`,
                    description: `[Link](${member.user.displayAvatarURL({size:1024,format:"png"})})`,
                    image: {url: member.user.displayAvatarURL({size:1024,dynamic:true})}
                }
            ], components: [row]
        })
}

};
