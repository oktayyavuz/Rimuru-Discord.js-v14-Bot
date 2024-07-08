const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("croxydb");
const config = require("../config.json");

module.exports = {
  name: "özel-oda-menü",
  description: 'Özel oda menüsü.',
  type: 1,
  options: [],
  run: async (client, interaction) => {
    let odasi = db.fetch(`oda_${interaction.user.id}`);
    if (!odasi) return interaction.reply("❌ | Sana ait bir oda bulamadım!");

    const embed = new EmbedBuilder()
      .setTitle(`${config["bot-adi"]} - Özel Oda Sistemi!`)
      .setDescription("Aşağıdaki butondan özel odana kullanıcı ekleyebilirsin!")
      .setColor("#ff0000");

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel("Ekle")
          .setStyle(ButtonStyle.Success)
          .setEmoji('1041737371131056218')
          .setCustomId("ekle_" + interaction.user.id),
        new ButtonBuilder()
          .setLabel("Çıkar")
          .setStyle(ButtonStyle.Danger)
          .setEmoji('1041737369436557393')
          .setCustomId("çıkar_" + interaction.user.id),
        new ButtonBuilder()
          .setLabel("Odayı sil")
          .setStyle(ButtonStyle.Danger)
          .setEmoji('1039607063443161158')
          .setCustomId("odayisil_" + interaction.user.id)
      );

    interaction.reply({ embeds: [embed], components: [row] });
  },
};

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  const customIdParts = interaction.customId.split('_');
  const action = customIdParts[0];
  const userId = customIdParts[1];


  const odasi = db.fetch(`oda_${userId}`);


  try {
      const channel = await interaction.guild.channels.fetch(odasi);

      switch (action) {
        case "ekle":
          const ekleEmbed = new EmbedBuilder()
            .setColor("#00ff00")
            .setDescription("Kullanıcı eklemek için bir kullanıcıyı etiketleyin.");
          await interaction.reply({ embeds: [ekleEmbed], ephemeral: true });

          const filter = m => m.author.id === interaction.user.id && m.mentions.users.size > 0;
          const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });

          collector.on('collect', async m => {
            const userToAdd = m.mentions.users.first();
            await channel.permissionOverwrites.create(userToAdd.id, { 
              Connect: true, 
              ViewChannel: true 
            });
            const successEmbed = new EmbedBuilder()
              .setColor("#00ff00")
              .setDescription(`✅ | ${userToAdd.username} kullanıcı başarıyla eklendi.`);
            await interaction.followUp({ embeds: [successEmbed], ephemeral: true });
          });

          collector.on('end', collected => {
            if (collected.size === 0) {
              interaction.followUp({ content: "❌ | Kullanıcı ekleme işlemi zaman aşımına uğradı.", ephemeral: true });
            }
          });
          break;

        case "çıkar":
          const cikarEmbed = new EmbedBuilder()
            .setColor("#ff0000")
            .setDescription("Kullanıcı çıkarmak için bir kullanıcıyı etiketleyin.");
          await interaction.reply({ embeds: [cikarEmbed], ephemeral: true });

          const cikarFilter = m => m.author.id === interaction.user.id && m.mentions.users.size > 0;
          const cikarCollector = interaction.channel.createMessageCollector({ filter: cikarFilter, max: 1, time: 60000 });

          cikarCollector.on('collect', async m => {
            const userToRemove = m.mentions.users.first();
            await channel.permissionOverwrites.delete(userToRemove.id);
            const successEmbed = new EmbedBuilder()
              .setColor("#00ff00")
              .setDescription(`✅ | ${userToRemove.username} kullanıcı başarıyla çıkarıldı.`);
            await interaction.followUp({ embeds: [successEmbed], ephemeral: true });
          });

          cikarCollector.on('end', collected => {
            if (collected.size === 0) {
              interaction.followUp({ content: "❌ | Kullanıcı çıkarma işlemi zaman aşımına uğradı.", ephemeral: true });
            }
          });
          break;

        case "odayisil":
          await channel.delete();
          db.delete(`oda_${userId}`);
          const silmeEmbed = new EmbedBuilder()
            .setColor("#ff0000")
            .setDescription(`✅ | Odanız başarıyla silindi.`);
          await interaction.reply({ embeds: [silmeEmbed], ephemeral: true });
          break;
        
        default:
      }
  } catch (error) {
      console.error("Bir hata oluştu:", error);
      const hataEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setDescription(`❌ | Bir hata oluştu. Lütfen tekrar deneyin.`);
      await interaction.reply({ embeds: [hataEmbed], ephemeral: true });
  }
});