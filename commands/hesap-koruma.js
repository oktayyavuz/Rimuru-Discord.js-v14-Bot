const { Client, EmbedBuilder } = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: "hesap-koruma",
  description: "Hesap Koruma Sistemini Açıp Kapatırsın!",
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
      name: "kanal",
      description: "Açıklaması Değiştirilecek Kanalı Ayarlarsın!",
      type: 7,
      required: true
    }
  ],

  run: async (client, interaction) => {
    const { options } = interaction;
    if (!interaction.member.permissions.has("MANAGE_ROLES")) return interaction.reply({ content: "❌ | Rolleri Yönet Yetkin Yok!", ephemeral: true });

    const kanal4 = options.getChannel("kanal");
    db.set(`hesapkoruma1_${interaction.guild.id}`, { channel: kanal4.id });

    const hesapkorumaSystemTrue = options.getString("seçenek");
    const hesapkorumaSystem = db.fetch(`hesapkoruma_${interaction.guild.id}`);

    switch (hesapkorumaSystemTrue) {
      case "ac": {
        const hesapkorumaSystemDate = db.fetch(`hesapkorumaDate_${interaction.guild.id}`);
        if (hesapkorumaSystem && hesapkorumaSystemDate) {
          const date = new EmbedBuilder()
            .setDescription(`❌ | Bu sistem <t:${parseInt(hesapkorumaSystemDate.date / 1000)}:R> önce açılmış!`);
          return interaction.reply({ embeds: [date] });
        }

        db.set(`hesapkoruma_${interaction.guild.id}`, true);
        db.set(`hesapkorumaDate_${interaction.guild.id}`, { date: Date.now() });
        return interaction.reply({ content: "✅ | Başarılı bir şekilde sistem açıldı!" });
      }

      case "kapat": {
        if (!hesapkorumaSystem) return interaction.reply({ content: "❌ | Bu sistem zaten kapalı?" });

        db.delete(`hesapkoruma_${interaction.guild.id}`);
        db.delete(`hesapkorumaDate_${interaction.guild.id}`);
        return interaction.reply({ content: "✅ | Başarılı bir şekilde sistem kapatıldı!" });
      }
    }
  }
};
