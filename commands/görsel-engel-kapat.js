const { PermissionsBitField } = require("discord.js");
const db = require("croxydb")
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name:"medya-kanalı-kapat",
    description: ' Görsel engel sistemini kapatırsın!',
    type:1,
    options: [],
  run: async(client, interaction) => {

    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({content: "❌ | Kanalları Yönet Yetkin Yok!", ephemeral: true})
   db.delete(`görselengel.${interaction.guild.id}`);

const embed = new EmbedBuilder()
  .setColor("Random")
  .setDescription(`✅ | Görsel Engel başarıyla kapatıldı!`);

interaction.reply({ embeds: [embed] });
},
};