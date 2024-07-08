const { PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'yaz',
  description: 'Belirttiğiniz mesajı kanala gönderir.',
  type: 1, 
  options: [],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
      return interaction.reply({ content: "❌ | Yetkin Yok!", ephemeral: true });
    }

    const modal = new ModalBuilder()
      .setCustomId('sendMessageModal')
      .setTitle('Mesaj Gönder');

    const messageInput = new TextInputBuilder()
      .setCustomId('messageInput')
      .setLabel("Göndermek istediğiniz mesajı yazınız:")
      .setStyle(TextInputStyle.Paragraph);

    const firstActionRow = new ActionRowBuilder().addComponents(messageInput);
    modal.addComponents(firstActionRow);

    await interaction.showModal(modal);
  }
};

client.on('interactionCreate', async interaction => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === 'sendMessageModal') {
    const mesaj = interaction.fields.getTextInputValue('messageInput');
    await interaction.channel.send({ content: mesaj });
    await interaction.reply({ content: 'Mesaj başarıyla gönderildi!', ephemeral: true });
  }
});
