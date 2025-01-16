const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: "küfür-engel",
  description: "Küfür Engel Sistemini Açıp Kapatırsın!",
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
    }
  ],

  run: async (client, interaction) => {
    const { user, guild, options } = interaction;
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({ content: "❌ | Rolleri Yönet Yetkin Yok!", ephemeral: true });
    }

    const kufurEngelSystemTrue = options.getString("seçenek");
    const kufurEngelSystem = db.fetch(`kufurengel_${interaction.guild.id}`);

    switch (kufurEngelSystemTrue) {
      case "ac": {
        const kufurEngelSystem = db.fetch(`kufurengel_${interaction.guild.id}`);
        const kufurengelDate = db.fetch(`kufurengelDate_${interaction.guild.id}`);

        if (kufurEngelSystem && kufurengelDate) {
          const date = new EmbedBuilder()
            .setDescription(`❌ | Bu sistem <t:${parseInt(kufurengelDate.date / 1000)}:R> önce açılmış!`);

          return interaction.reply({ embeds: [date] });
        }

        db.set(`kufurengel_${interaction.guild.id}`, true);
        db.set(`kufurengelDate_${interaction.guild.id}`, { date: Date.now() });

        const embed = new EmbedBuilder()
          .setColor("Green")
          .setDescription("✅ | Başarılı bir şekilde küfür engel sistemi açıldı!")
          .addFields(
            { name: "Açan Kullanıcı", value: user.tag, inline: true },
            { name: "Sunucu", value: guild.name, inline: true },
            { name: "Açılma Zamanı", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
          )
          .setImage("https://i.hizliresim.com/4142ql1.gif")

        return interaction.reply({ embeds: [embed] });
      }

      case "kapat": {
        if (!kufurEngelSystem) {
          return interaction.reply({ content: "❌ | Bu sistem zaten kapalı?" });
        }

        db.delete(`kufurengel_${interaction.guild.id}`);
        db.delete(`kufurengelDate_${interaction.guild.id}`);

        const embed = new EmbedBuilder()
          .setColor("Red")
          .setDescription("✅ | Başarılı bir şekilde küfür engel sistemi kapatıldı!")
          .addFields(
            { name: "Kapatan Kullanıcı", value: user.tag, inline: true },
            { name: "Sunucu", value: guild.name, inline: true },
            { name: "Kapatılma Zamanı", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
          )
          .setImage("https://i.hizliresim.com/4142ql1.gif")

        return interaction.reply({ embeds: [embed] });
      }
    }
  }
};