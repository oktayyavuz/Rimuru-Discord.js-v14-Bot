const { PermissionsBitField } = require("discord.js");
const db = require("croxydb")
module.exports = {
    name:"oto-rol-kapat",
    description: ' Oto-Rol Sistemini kapatır!',
    type:1,
    options: [],
  run: async(client, interaction) => {

    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return interaction.reply({content: "❌ | Rolleri Yönet Yetkin Yok!", ephemeral: true})
    db.delete(`otorol_${interaction.guild.id}`)
    db.delete(`botrol_${interaction.guild.id}`)
    interaction.reply({content: "✅ | Otorol Başarıyla kapatıldı!"})
}

};
