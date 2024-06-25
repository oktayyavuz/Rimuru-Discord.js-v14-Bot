const { EmbedBuilder } = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: "uyarı-ayar",
  description: "Uyarı ayarları",
  type: 1,
  options: [
    {
      name: "mute-rol",
      description: "Mute rolünü belirleyin",
      type: 8,
      required: true
    },
    {
      name: "jail-rol",
      description: "Jail rolünü belirleyin",
      type: 8,
      required: true
    },
    {
      name: "mod-rol",
      description: "Uyarı yetkilisini ayarlarsın!",
      type: 8,
      required: true,
    },
    {
      name: "log-kanal",
      description: "Uyarıları kaydetmek için log kanalını belirleyin",
      type: 7,
      required: true
    }
  ],

  run: async (client, interaction) => {
    const muteRole = interaction.options.getRole("mute-rol");
    const jailRole = interaction.options.getRole("jail-rol");
    const modRole = interaction.options.getRole("mod-rol");
    const logChannel = interaction.options.getChannel("log-kanal");

    db.set(`Mute_${interaction.guild.id}`, muteRole.id);
    db.set(`Jail_${interaction.guild.id}`, jailRole.id);
    db.set(`Mod_${interaction.guild.id}`, modRole.id);
    db.set(`logChannel_${interaction.guild.id}`, logChannel.id);

    const embed = new EmbedBuilder()
      .setColor("Aqua")
      .setTitle("Uyarı Ayarları Güncellendi")
      .setDescription("Uyarı ayarları başarıyla güncellendi.")
      .addFields(
        { name: "Mute Rolü", value: `<@&${muteRole.id}>` },
        { name: "Jail Rolü", value: `<@&${jailRole.id}>` },
        { name: "Mod Rolü", value: `<@&${modRole.id}>` },
        { name: "Log Kanalı", value: `<#${logChannel.id}>` }
      )
      .setTimestamp()
      .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ format: "png", dynamic: true, size: 2048 }) });

    interaction.reply({ embeds: [embed] });
    db.set(`warnayar_${interaction.guild.id}`, logChannel.id);

  }
};