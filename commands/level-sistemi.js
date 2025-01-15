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

    if (levelSystem && levelSystemTrue === "ac" && logChannel) {
      client.on("messageCreate", async (message) => {
        if (message.author.bot) return;

        const userId = message.author.id;
        const guildId = guild.id;

        const level = db.fetch(`level_${guildId}_${userId}`) || 1;
        const experience = db.fetch(`experience_${guildId}_${userId}`) || 0;
        const experiencePointsForNextLevel = 5 * Math.pow(level, 2) + 50 * level + config.levelXp;

        const experiencePerMessage = 10;
        db.add(`experience_${guildId}_${userId}`, experiencePerMessage);

        if (experience + experiencePerMessage >= experiencePointsForNextLevel) {
          db.set(`level_${guildId}_${userId}`, level + 1);
          db.set(`experience_${guildId}_${userId}`, experience + experiencePerMessage - experiencePointsForNextLevel);

          const rankMessage = new EmbedBuilder()
            .setTitle(`${message.author.username} Seviyesi Arttı!`)
            .setDescription(`${message.author} kullanıcısının seviyesi <:level:1033329322044303410> **${level + 1}** seviyeye ulaştı!`)
            .setColor("Green");

          logChannel.send({ embeds: [rankMessage] });
        }
      });
    }
  },
};
