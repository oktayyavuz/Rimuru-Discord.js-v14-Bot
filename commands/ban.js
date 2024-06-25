const { Client, EmbedBuilder, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");
const db = require("croxydb");

module.exports = {
    name: "ban",
    description: 'Kullanıcıyı Sunucudan Yasaklarsın.',
    type: 1,
    options: [
        {
            name: "user",
            description: "Yasaklanıcak Kullanıcıyı Seçin.",
            type: 6,
            required: true
        }
    ],
    run: async(client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: "❌ | Üyeleri Yasakla Yetkin Yok!", ephemeral: true });
        }

        const user = interaction.options.getMember('user');
        if (!user) {
            return interaction.reply({ content: "❌ | Geçersiz Kullanıcı.", ephemeral: true });
        }
        
        if (user.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: "❌ | Bu Kullanıcının Ban Yetkisi Olduğu İçin Onu Yasaklayamadım.", ephemeral: true });
        }

        const modal = new ModalBuilder()
            .setCustomId('banReasonModal')
            .setTitle('Ban Sebebi');

        const reasonInput = new TextInputBuilder()
            .setCustomId('banReason')
            .setLabel("Hangi Sebepten dolayı yasaklanıcak?")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const actionRow = new ActionRowBuilder().addComponents(reasonInput);
        modal.addComponents(actionRow);

        await interaction.showModal(modal);

        const filter = (modalInteraction) => modalInteraction.customId === 'banReasonModal' && modalInteraction.user.id === interaction.user.id;
        interaction.awaitModalSubmit({ filter, time: 60000 })
            .then(async modalInteraction => {
                const reason = modalInteraction.fields.getTextInputValue('banReason');

                const dmEmbed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle(`Yasaklandınız`)
                    .setDescription(`## ${interaction.guild.name} Sunucusundan yasaklandınız! ⚠⚠ \n\n> **Banlanma Sebebiniz:** ${reason}.`)
                    .setImage("https://media1.tenor.com/m/qZczws-GVsMAAAAd/megiddo.gif");

                try {
                    await user.send({ embeds: [dmEmbed] });
                } catch (err) {
                    console.error('DM mesajı gönderilemedi:', err);
                }

                await user.ban({ reason: reason });

                const embed = new EmbedBuilder()
                    .setColor("Random")
                    .setDescription(`✅ | Başarıyla ${user} Kullanıcısını Banladım.`);

                await modalInteraction.reply({ embeds: [embed] });

                try {
                    const modLogChannelId = db.get(`modlogK_${interaction.guild.id}`);
                    if (modLogChannelId) {
                        const modLogChannel = client.channels.cache.get(modLogChannelId);
                        if (modLogChannel) {
                            const logEmbed = new EmbedBuilder()
                                .setTitle('Kullanıcı Banlandı')
                                .addFields(
                                    { name: 'Banlanan kullanıcı', value: `${user}`, inline: true },
                                    { name: 'Banlayan yetkili', value: `${interaction.user}`, inline: true },
                                    { name: 'Sebep', value: `${reason}`, inline: true },
                                )
                                .setTimestamp()
                                .setImage("https://media1.tenor.com/m/qZczws-GVsMAAAAd/megiddo.gif");


                            modLogChannel.send({ embeds: [logEmbed] });
                        } else {
                            console.error(`Modlog kanalı bulunamadı: ${modLogChannelId}`);
                        }
                    } else {
                        console.error(`Modlog kanalı veritabanında bulunamadı: ${interaction.guild.id}`);
                    }
                } catch (error) {
                    console.error('Mod Kanalı Bulunamadı', error);
                }
            })
            .catch(err => {
                console.error('Modal gönderimi zaman aşımına uğradı veya başarısız oldu:', err);
                interaction.followUp({ content: "❌ | Ban işlemi iptal edildi.", ephemeral: true });
            });
    }
};