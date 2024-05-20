const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: "uyarı-ayar",
  description: "Uyarı ayarları",
  type: 5,
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
    const modRole = interaction.options.getRole("mod-rol") || interaction.guild.roles.cache.find(role => role.name === "Moderatör");
    const muteRole = interaction.options.getRole("mute-rol") || interaction.guild.roles.cache.find(role => role.name === "Muted");
    const jailRole = interaction.options.getRole("jail-rol") || interaction.guild.roles.cache.find(role => role.name === "Jailed");

    const mod = interaction.options.getRole('mod-rol')
    const mute = interaction.options.getRole('mute-rol')
    const jail = interaction.options.getRole('jail-rol')
    db.set(`Mod_${interaction.guild.id}`, mod);
    db.set(`Mute_${interaction.guild.id}`, mute);
    db.set(`Jail_${interaction.guild.id}`, jail);

    const logChannel = interaction.options.getChannel("log-kanal") || interaction.guild.channels.cache.find(channel => channel.name === "logs");

    if (logChannel) {
      db.set(`logChannel_${interaction.guild.id}`, logChannel.id);
    }

    interaction.reply({ content: " ✅| Uyarı ayarları başarıyla güncellendi.", ephemeral: false });
  }
};
