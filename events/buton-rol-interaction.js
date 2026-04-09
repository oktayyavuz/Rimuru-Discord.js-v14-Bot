module.exports = {
  name: "interactionCreate",
  run: async (client, interaction) => {
    if (!interaction.isButton()) return;
    const { customId } = interaction;

    if (customId.startsWith('rol_')) {
      const rolID = customId.split('_')[1];
      const rol = interaction.guild.roles.cache.get(rolID);
      if (!rol) return;

      const member = interaction.member;
      const botRole = interaction.guild.members.me.roles.highest;

      if (rol.position >= botRole.position) {
        return interaction.reply({ content: `❌ | Bot, ${rol.name} rolünü vermek veya almak için yeterli yetkiye sahip değil.`, ephemeral: true });
      }

      try {
        if (member.roles.cache.has(rolID)) {
          await member.roles.remove(rolID);
          await interaction.reply({ content: `❌ | ${rol.name} rolü kaldırıldı!`, ephemeral: true });
        } else {
          await member.roles.add(rolID);
          await interaction.reply({ content: `✅ | ${rol.name} rolü verildi!`, ephemeral: true });
        }
      } catch (error) {
        console.error('Rol verme/alma işlemi sırasında hata:', error);
        await interaction.reply({ content: `❌ | Rol işlemi sırasında bir hata oluştu.`, ephemeral: true });
      }
    }
  }
};
