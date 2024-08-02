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
    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: "❌ | Üyeleri Yasakla Yetkin Yok!", ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return interaction.reply({ content: "❌ | Bu kullanıcı sunucuda bulunmuyor.", ephemeral: true });
        }

        const botMember = interaction.guild.members.cache.get(client.user.id);

        if (member.roles.highest.position >= botMember.roles.highest.position) {
            return interaction.reply({ content: "❌ | Bu kullanıcı benden daha yüksek bir role sahip olduğu için onu yasaklayamam.", ephemeral: true });
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
                    .setTitle(`❗ Yasaklandınız ❗`)
                    .setDescription(`**${interaction.guild.name}** sunucusundan yasaklandınız.\n\n**Banlanma Sebebiniz:**\n${reason}`)
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setTimestamp()
                    .setFooter({ text: "Yasaklama Bildirimi", iconURL: client.user.displayAvatarURL({ dynamic: true }) });

                try {
                    await user.send({ embeds: [dmEmbed] });
                } catch (err) {
                    console.error('DM mesajı gönderilemedi:', err);
                }

                try {
                    await member.ban({ reason: reason });

                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setDescription(`✅ | Başarıyla ${user.tag} Kullanıcısını Banladım.`);

                    await interaction.followUp({ embeds: [embed] });
                } catch (error) {
                    if (error.code === 50013) {
                        await interaction.followUp({ content: "❌ | Kullanıcıyı yasaklamak için yeterli yetkim yok.", ephemeral: true });
                    } else if (error.code === 429) {
                        await interaction.followUp({ content: "❌ | Rate limit aşıldı, lütfen daha sonra tekrar deneyin.", ephemeral: true });
                    } else {
                        console.error(error);
                        await interaction.followUp({ content: "❌ | Kullanıcıyı yasaklarken bir hata oluştu.", ephemeral: true });
                    }
                }

                try {
                    const modLogChannelId = db.get(`modlogK_${interaction.guild.id}`);
                    if (modLogChannelId) {
                        const modLogChannel = client.channels.cache.get(modLogChannelId);
                        if (modLogChannel) {
                            const logEmbed = new EmbedBuilder()
                                .setTitle('Kullanıcı Banlandı')
                                .addFields(
                                    { name: 'Banlanan kullanıcı', value: `${user}` },
                                    { name: 'Banlayan yetkili', value: `${interaction.user}` },
                                    { name: 'Sebep', value: `${reason}` },
                                )
                                .setTimestamp();

                            modLogChannel.send({ embeds: [logEmbed] });
                        }
                    }
                } catch (error) {
                    console.error('Modlog gönderiminde hata:', error);
                } finally {
                    await modalInteraction.deferUpdate();
                }
            })
            .catch(err => {
                console.error('Modal gönderimi zaman aşımına uğradı veya başarısız oldu:', err);
                interaction.followUp({ content: "❌ | Ban işlemi sırasında bir hata oluştu veya işlem zaman aşımına uğradı.", ephemeral: true });
            });
    }
};
