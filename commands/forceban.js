const { PermissionsBitField } = require("discord.js");
const db = require("croxydb")
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "forceban",
  description: "ID ile kullanıcı yasaklarsın!",
  type: 1,
  options: [
    {
      name: "id",
      description: "Lütfen bir kullanıcı ID girin!",
      type: 3,
      required: true
    },
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return interaction.reply({ content: "❌ | Üyeleri Yasakla Yetkin Yok!", ephemeral: true });
    const id = interaction.options.getString("id");
    interaction.guild.members.ban(id).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setDescription(`${id} ✅ | IDLI Kullanıcı Başarıyla Yasaklandı!`);

    interaction.reply({ embeds: [embed] });
  }
};