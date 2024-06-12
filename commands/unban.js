const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
module.exports = {
    name:"unban",
    description: ' Kullanıcının Yasağını Kaldırırsın!',
    type:1,
    options: [
        {
            name:"id",
            description:"Kullanıcı ID Girin!",
            type:3,
            required:true
        },
    ],
  run: async(client, interaction) => {

    if(!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return interaction.reply({content: "❌ | Üyeleri Yasakla Yetkin Yok!", ephemeral: true})
    const user = interaction.options.getString('id')
    
    interaction.guild.members.unban(user);

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setDescription(`✅ | Başarıyla ${user} isimli kişinin yasağını kaldırdım.`);
    
    interaction.reply({ embeds: [embed] });
    },
};
