const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
module.exports = {
    name:"sil",
    description: ' Sohbette istediğin kadar mesajı silersin!',
    type:1,
    options: [
        {
            name:"sayı",
            description:"Temizlencek Mesaj Sayısını Girin.",
            type:3,
            required:true
        },
       
    ],
  run: async(client, interaction) => {

    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return interaction.reply({content: "❌ | Mesajları Yönet Yetkin Yok!", ephemeral: true})
    const sayi = interaction.options.getString('sayı')
    interaction.channel.bulkDelete(sayi);

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setDescription(`✅ | Başarıyla ${sayi} mesajı sildim.`)
      .setImage("https://i.hizliresim.com/t7sp6n3.gif")
    
    interaction.reply({ embeds: [embed] });
    },
};
