const { PermissionsBitField } = require("discord.js");
const db = require("croxydb")
module.exports = {
    name:"özel-oda-sil",
    description: 'Özel odanı silersin.',
    type:1,
    options: [],
  run: async(client, interaction) => {

    let odasi = db.fetch(`oda_${interaction.user.id}`)
    if (!odasi) return interaction.reply("❌ | Sana ait bir oda bulamadım!")
    interaction.reply("✅ | Odan Başarıyla Silindi!")
    interaction.guild.channels.delete(odasi)
}

};