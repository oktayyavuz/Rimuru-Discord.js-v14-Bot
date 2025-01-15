const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb")
module.exports = {
    name:"oto-tag-kapat",
    description: ' Oto-tag sistemini kapatırsın!',
    type:1,
    options: [],
  run: async(client, interaction) => {

    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) return interaction.reply({content: "❌ | İsimleri Yönet Yetkin Yok!", ephemeral: true})
    db.delete(`ototag_${interaction.guild.id}`);

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setDescription(`✅ | Başarıyla sitemi sıfırladım!`);
    
    interaction.reply({ embeds: [embed] });
    },

};
