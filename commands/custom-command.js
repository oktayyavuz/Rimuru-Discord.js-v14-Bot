const { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, PermissionsBitField } = require("discord.js");
const db = require("croxydb");
const config = require("../config.json");

module.exports = {
  name: "custom-command",
  description: 'Özel komut yönetimi.',
  type: 1,
  options: [],
  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
      return interaction.reply({ content: "❌ | Yeterli yetkiye sahip değilsiniz!", ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle(`${config["bot-adi"]} - Özel Komut Sistemi!`)
      .setDescription("Aşağıdaki seçim menüsünü kullanarak özel komutlarını yönet.")
      .setColor("#ff0000")
      .setImage("https://i.imgur.com/eINVOb7.gif")


    const row = new ActionRowBuilder()
      .addComponents(
        new SelectMenuBuilder()
          .setCustomId("custom-command-menu")
          .setPlaceholder("Bir seçenek seçin")
          .addOptions([
            {
              label: "Özel Komut Ekle",
              description: "Yeni bir özel komut ekle",
              value: "add_custom_command",
            },
            {
              label: "Özel Komut Sil",
              description: "Mevcut bir özel komutu sil",
              value: "delete_custom_command",
            },
            {
              label: "Özel Komutları Listele",
              description: "Tüm özel komutları listele",
              value: "list_custom_commands",
            },
          ])
      );

    interaction.reply({ embeds: [embed], components: [row] });
  },
};