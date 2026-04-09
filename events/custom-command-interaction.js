const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, InteractionType, PermissionsBitField, EmbedBuilder } = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: "interactionCreate",
  run: async (client, interaction) => {
    if (interaction.isSelectMenu() && interaction.customId === "custom-command-menu") {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
        return interaction.reply({ content: "❌ | Yeterli yetkiye sahip değilsiniz!", ephemeral: true });

      const selectedValue = interaction.values[0];

      if (selectedValue === "add_custom_command") {
        const modal = new ModalBuilder()
          .setCustomId("addCustomCommandModal")
          .setTitle("Özel Komut Ekle")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("commandName")
                .setLabel("Komut Adı")
                .setStyle(TextInputStyle.Short)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("commandText")
                .setLabel("Komut Metni")
                .setStyle(TextInputStyle.Paragraph)
            )
          );
        await interaction.showModal(modal);
      } else if (selectedValue === "delete_custom_command") {
        const modal = new ModalBuilder()
          .setCustomId("deleteCustomCommandModal")
          .setTitle("Özel Komut Sil")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("commandName")
                .setLabel("Komut Adı")
                .setStyle(TextInputStyle.Short)
            )
          );
        await interaction.showModal(modal);
      } else if (selectedValue === "list_custom_commands") {
        const commands = Object.entries(db.all()).filter(([key, value]) => key.startsWith(`custom_command_${interaction.guild.id}_`));
        const commandList = commands.map(([key, entry]) => `**${key.replace(`custom_command_${interaction.guild.id}_`, "")}**: ${entry}`).join("\n") || "Henüz eklenmiş özel komut yok.";

        const embed = new EmbedBuilder()
          .setTitle("Özel Komutlar")
          .setDescription(commandList)
          .setColor("#00ff00");

        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    } else if (interaction.type === InteractionType.ModalSubmit) {
      if (interaction.customId === "addCustomCommandModal") {
        const commandName = interaction.fields.getTextInputValue("commandName");
        const commandText = interaction.fields.getTextInputValue("commandText");

        db.set(`custom_command_${interaction.guild.id}_${commandName}`, commandText);

        await interaction.reply({ content: `✅ | **${commandName}** adlı özel komut başarıyla eklendi.`, ephemeral: true });
      } else if (interaction.customId === "deleteCustomCommandModal") {
        const commandName = interaction.fields.getTextInputValue("commandName");

        db.delete(`custom_command_${interaction.guild.id}_${commandName}`);

        await interaction.reply({ content: `✅ | **${commandName}** adlı özel komut başarıyla silindi.`, ephemeral: true });
      }
    }
  }
};
