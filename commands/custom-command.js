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
      .setImage("https://i.hizliresim.com/orosrif.gif")


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

client.on('interactionCreate', async interaction => {
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
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const prefix = config.prefix;
  if (!message.content.startsWith(prefix)) return;

  const commandName = message.content.slice(prefix.length).trim().split(/ +/).shift().toLowerCase();
  const commandText = db.fetch(`custom_command_${message.guild.id}_${commandName}`);

  if (commandText) {
    message.channel.send(commandText);
  }
});