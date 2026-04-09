module.exports = {
  name: "interactionCreate",
  run: async (client, interaction) => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'sendMessageModal') {
      const mesaj = interaction.fields.getTextInputValue('messageInput');
      await interaction.channel.send({ content: mesaj }).catch(() => {});
      await interaction.reply({ content: 'Mesaj başarıyla gönderildi!', ephemeral: true }).catch(() => {});
    }
  }
};
