const { Client, EmbedBuilder, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("croxydb");
const config = require("../config.json");

module.exports = {
  name: "buton-rol",
  description: "Rol alma sistemini ayarlarsın!",
  type: 1,
  options: [
    {
      name: "roller",
      description: "Lütfen birden fazla rol etiketle (Boşluklarla ayırın)!",
      type: 3,
      required: true
    }
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({ content: "❌ | Rolleri Yönet Yetkin Yok!", ephemeral: true });
    }

    const roller = interaction.options.getString('roller').split(' ');
    const botRole = interaction.guild.members.me.roles.highest;

    const invalidRoles = roller.filter(rolID => {
      const rol = interaction.guild.roles.cache.get(rolID.replace(/[<@&>]/g, ''));
      return rol && rol.position >= botRole.position;
    });

    if (invalidRoles.length > 0) {
      return interaction.reply({ 
        content: `❌ | Bot, şu rolleri vermek için yeterli yetkiye sahip değil: ${invalidRoles.join(', ')}. Lütfen bot rolünü bu rollerden daha yükseğe taşıyın.`, 
        ephemeral: true 
      });
    }

    const modal = new ModalBuilder()
      .setCustomId('embedModal')
      .setTitle('Embed Mesajı Yazın');

    const embedInput = new TextInputBuilder()
      .setCustomId('embedInput')
      .setLabel('Embed Mesajı')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const actionRow = new ActionRowBuilder().addComponents(embedInput);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);

    const filter = (modalInteraction) => modalInteraction.customId === 'embedModal' && modalInteraction.user.id === interaction.user.id;
    interaction.awaitModalSubmit({ filter, time: 60000 })
      .then(async modalInteraction => {
        const yazı = modalInteraction.fields.getTextInputValue('embedInput');

        const embed = new EmbedBuilder()
          .setTitle(`${config["bot-adi"]} - Buton Rol Al Sistemi!`)
          .setDescription(yazı)
          .setImage("https://i.hizliresim.com/8a09g00.gif")
          .setColor("#ff0000");

        const rows = [];
        let currentRow = new ActionRowBuilder();

        roller.forEach((rolID, index) => {
          const rol = interaction.guild.roles.cache.get(rolID.replace(/[<@&>]/g, ''));
          if (rol && rol.position < botRole.position) {
            currentRow.addComponents(
              new ButtonBuilder()
                .setLabel(rol.name)
                .setStyle(ButtonStyle.Primary)
                .setCustomId(`rol_${rol.id}`)
            );

            if ((index + 1) % 5 === 0 || (index + 1) === roller.length) {
              rows.push(currentRow);
              currentRow = new ActionRowBuilder();
            }
          }
        });

        if (currentRow.components.length > 0) {
          rows.push(currentRow);
        }

        await modalInteraction.reply({ embeds: [embed], components: rows });

        roller.forEach((rolID) => {
          const rol = interaction.guild.roles.cache.get(rolID.replace(/[<@&>]/g, ''));
          if (rol && rol.position < botRole.position) {
            db.set(`buton_rol${interaction.guild.id}_${rolID}`, rolID);
          }
        });
      })
      .catch(err => {
        console.error('Modal gönderimi zaman aşımına uğradı veya başarısız oldu:', err);
        interaction.followUp({ content: "❌ | Mesaj yazma işlemi sırasında bir hata oluştu veya işlem zaman aşımına uğradı.", ephemeral: true });
      });
  }
};

client.on('interactionCreate', async buttonInteraction => {
  if (!buttonInteraction.isButton()) return;
  const { customId } = buttonInteraction;

  if (customId.startsWith('rol_')) {
    const rolID = customId.split('_')[1];
    const rol = buttonInteraction.guild.roles.cache.get(rolID);
    if (!rol) return;

    const member = buttonInteraction.member;
    const botRole = buttonInteraction.guild.members.me.roles.highest;

    if (rol.position >= botRole.position) {
      return buttonInteraction.reply({ content: `❌ | Bot, ${rol.name} rolünü vermek veya almak için yeterli yetkiye sahip değil.`, ephemeral: true });
    }

    try {
      if (member.roles.cache.has(rolID)) {
        await member.roles.remove(rolID);
        await buttonInteraction.reply({ content: `❌ | ${rol.name} rolü kaldırıldı!`, ephemeral: true });
      } else {
        await member.roles.add(rolID);
        await buttonInteraction.reply({ content: `✅ | ${rol.name} rolü verildi!`, ephemeral: true });
      }
    } catch (error) {
      console.error('Rol verme/alma işlemi sırasında hata:', error);
      await buttonInteraction.reply({ content: `❌ | Rol işlemi sırasında bir hata oluştu.`, ephemeral: true });
    }
  }
});
