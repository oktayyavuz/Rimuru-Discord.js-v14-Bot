const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const config = require('../config.json');
module.exports = {
  name: "level-sistemi",
  description: "Level sistemini açıp kapatırsın.",
  type: 1,
  options: [
    {
      type: 3,
      name: "seçenek",
      description: "Sistemi kapatacak mısın yoksa açacak mısın?",
      required: true,
      choices: [
        {
          name: "Aç",
          value: "ac"
        },
        {
          name: "Kapat",
          value: "kapat"
        }
      ]
    },
    {
      name: "log",
      description: "Level log kanalını ayarlarsın!",
      type: 7,
      required: true,
      channel_types: [0]
    },
  ],

  run: async (client, interaction, db) => {
    const { guild, options } = interaction;
    const levelSystem = db.fetch(`acikmiLevel_${guild.id}`) ? true : false;
    const levelSystemTrue = options.getString("seçenek");
    const logChannel = options.getChannel("log");

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({ content: "❌ | Kanalları Yönet Yetkin Yok!", ephemeral: true });
    }

    switch (levelSystemTrue) {
      case "ac": {
        const levelSystemDate = db.fetch(`levelSystemDate_${guild.id}`);
        if (levelSystem && levelSystemDate && logChannel) {
          const date = new EmbedBuilder()
            .setDescription(`❌ | Bu sistem <t:${parseInt(levelSystemDate.date / 1000)}:R> önce açılmış!`);
          return interaction.reply({ embeds: [date] });
        }
        db.set(`acikmiLevel_${guild.id}`, true);
        db.set(`levelSystemDate_${guild.id}`, { date: Date.now() });
        db.set(`level_log_${guild.id}`, logChannel.id);

        const embed = new EmbedBuilder()
          .setTitle("Level Sistemi Açıldı")
          .setDescription(`✔ Level sistemi başarıyla açıldı!\n\n✔ Level log kanalı <#${logChannel.id}> olarak ayarlandı!`)
          .setColor("Green");

        return interaction.reply({ embeds: [embed] });
      }

      case "kapat": {
        if (!levelSystem) return interaction.reply({ content: "❌ | Bu sistem zaten kapalı?" });

        db.delete(`acikmiLevel_${guild.id}`);
        db.delete(`levelSystemDate_${guild.id}`);

        const embed = new EmbedBuilder()
          .setTitle("Level Sistemi Kapatıldı")
          .setDescription(`Level sistemi başarıyla kapatıldı!`)
          .setColor("Red");

        return interaction.reply({ embeds: [embed] });
      }
    }

    return interaction.reply({ embeds: [embed] });
  }
}


