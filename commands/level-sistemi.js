const { AttachmentBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");

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
      required: false,
      channel_types: [0]
    },
  ],

  run: async(client, interaction, db, Rank, AddRank, RemoveRank) => {
    const { user, guild, options } = interaction;

    const levelSystem = db.fetch(`acikmiLevel_${guild.id}`) ? true : false;
    const levelSystemTrue = options.getString("seçenek");
    const logChannel = options.getChannel("log");

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({ content: "❌ | Kanalları Yönet Yetkin Yok!", ephemeral: true });
    }

    switch(levelSystemTrue) {
      case "ac": {
        const levelSystemDate = db.fetch(`levelSystemDate_${interaction.guild.id}`);

        if (levelSystem && levelSystemDate && logChannel) {
          const date = new EmbedBuilder()
            .setDescription(`❌ | Bu sistem <t:${parseInt(levelSystemDate.date / 1000)}:R> önce açılmış!`)

          return interaction.reply({ embeds: [date] });
        }
        db.set(`acikmiLevel_${guild.id}`, true);
        db.set(`levelSystemDate_${interaction.guild.id}`, { date: Date.now() });
        db.set(`level_log_${interaction.guild.id}`, logChannel.id);

        const embed = new EmbedBuilder()
          .setTitle("Level Sistemi Açıldı")
          .setDescription(`✔ Level sistemi başarıyla açıldı!\n\n ✔ Level log kanalı <#${logChannel.id}> olarak ayarlandı!`)
          .setColor("Green");

        return interaction.reply({ embeds: [embed] });
      }

      case "kapat": {
        if(!levelSystem) return interaction.reply({ content: "❌ | Bu sistem zaten kapalı?" });

        db.delete(`acikmiLevel_${guild.id}`);
        db.delete(`levelSystemDate_${interaction.guild.id}`);

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

        const level = db.fetch(`level_${guild.id}_${message.author.id}`) || 1;
        const rank = db.fetch(`rank_${guild.id}_${message.author.id}`) || 1;

        const experiencePointsForNextLevel = Math.pow(level, 2) * 100;

        if (level < 10) {
          db.add(`level_${guild.id}_${message.author.id}`, 1);
          db.add(`experience_${guild.id}_${message.author.id}`, 10);

          if (db.fetch(`experience_${guild.id}_${message.author.id}`) >= experiencePointsForNextLevel) {
            db.set(`level_${guild.id}_${message.author.id}`, level + 1);
            db.set(`experience_${guild.id}_${message.author.id}`, 0);

            const rankMessage = new EmbedBuilder()
              .setTitle(`${message.author.username} Seviyesi Artışı!`)
              .setDescription(`${message.author} kullanıcısının seviyesi <:level:1033329322044303410> **${level + 1}** seviyeye ulaştı!`)
              .setColor("Green");

            logChannel.send({ embeds: [rankMessage] });
          }
        } else {
          db.add(`level_${guild.id}_${message.author.id}`, 1);
          db.add(`experience_${guild.id}_${message.author.id}`, 10);

          if (db.fetch(`experience_${guild.id}_${message.author.id}`) >= experiencePointsForNextLevel) {
            db.set(`level_${guild.id}_${message.author.id}`, level + 1);
            db.set(`experience_${guild.id}_${message.author.id}`, 0);

            const rankMessage = new EmbedBuilder()
              .setTitle(`${message.author.username} Seviyesi Artışı!`)
              .setDescription(`${message.author} kullanıcısının seviyesi <:level:1033329322044303410> **${level + 1}** seviyeye ulaştı!`)
              .setColor("Green");

            logChannel.send({ embeds: [rankMessage] });
          }
        }

        if (newRank % 10 === 0) {
          const rank = await Rank.findOne({
            where: {
              guildId: guild.id,
              userId: message.author.id,
              rank: newRank,
            },
          });

          if (!rank) {
            await Rank.create({
              guildId: guild.id,
              userId: message.author.id,
              rank: newRank,
            });
          }
        }
      });
    }
  },
};