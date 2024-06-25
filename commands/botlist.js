const Discord = require("discord.js");
const db = require("croxydb");
const config = require("../config.json");

module.exports = {
    name: "botlist-ayarla",
    description: "Botlist sistemini ayarlarsınız!",
    type: 1,
    options: [
        {
            name: "botlist-log",
            description: "Botlist log kanalını ayarlarsınız!",
            type: 7,
            required: true,
            channel_types: [0]
        },
        {
            name: "bot-rolü",
            description: "Botlara verilecek rolü ayarlarsınız!",
            type: 8,
            required: true
        },
        {
            name: "developer-rolü",
            description: "Botunu ekleyen kişilere verilecek rolü ayarlarsınız!",
            type: 8,
            required: true
        },
        {
            name: "yetkili-rolü",
            description: "Sunucunuza bot ekleyecek yetkili rolünü ayarlarsınız!",
            type: 8,
            required: true,
        },
        {
            name: "onay-kanalı",
            description: "Botlist onay kanalını ayarlarsınız!",
            type: 7,
            required: true,
            channel_types: [0]
        },
        {
            name: "botekle-kanalı",
            description: "Botların eklenebileceği kanalı ayarlarsınız!",
            type: 7,
            required: true,
            channel_types: [0]
        },
        {
            name: "ayrıldı-log",
            description: "Sunucu sahipleri çıktığında atılacak mesajın log kanalını ayarlarsınız!",
            type: 7,
            required: true,
            channel_types: [0]
        }
    ],
    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                embeds: [new Discord.EmbedBuilder()
                    .setColor("Red")
                    .setTitle("Yetersiz Yetki!")
                    .setDescription("❌ | Bu komutu kullanabilmek için `Yönetici` yetkisine sahip olmalısın!")
                    .setFooter({ text: `${config["bot-adi"]}` })
                ], ephemeral: true
            });
        }

        const log = interaction.options.getChannel('botlist-log');
        const botRol = interaction.options.getRole('bot-rolü');
        const devRol = interaction.options.getRole('developer-rolü');
        const adminRol = interaction.options.getRole('yetkili-rolü');
        const onay = interaction.options.getChannel('onay-kanalı');
        const botekle = interaction.options.getChannel('botekle-kanalı');
        const ayrildiLog = interaction.options.getChannel('ayrıldı-log');

        const row1 = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setEmoji("1039607040898781325")
                    .setLabel("Ayarlar")
                    .setStyle(Discord.ButtonStyle.Primary)
                    .setCustomId("botlist_ayarlar_" + interaction.user.id)
            )
            .addComponents(
                new Discord.ButtonBuilder()
                    .setEmoji("1039607063443161158")
                    .setLabel("Sistemi Sıfırla")
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setCustomId("botlist_kapat_" + interaction.user.id)
            )
            .addComponents(
                new Discord.ButtonBuilder()
                    .setEmoji("1039607042291269703")
                    .setLabel("Bilgilendirme")
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setCustomId("botlist_bilgilendirme_" + interaction.user.id)
            );

        const basarili = new Discord.EmbedBuilder()
            .setColor("Green")
            .setTitle("✅ | Başarıyla Ayarlandı!")
            .setDescription("✅ | Botlist sistemi başarıyla ayarlandı!")
            .setImage("https://i.hizliresim.com/8a09g00.gif")
            .setFooter({ text: `${config["bot-adi"]}` });

        const menu = new Discord.EmbedBuilder()
            .setColor("Random")
            .setTitle("❔ | Botumu Nasıl Eklerim?")
            .setDescription("> Aşağıdaki **Bot Ekle** butonuna basarak botunu ekleyebilirsin!")
            .setFooter({ text: `${config["bot-adi"]}` });

        const row11 = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setEmoji("1039607042291269703")
                    .setLabel("Bot Ekle")
                    .setStyle(Discord.ButtonStyle.Primary)
                    .setCustomId("botlist_botekle_everyone")
            );

        botekle.send({ embeds: [menu], components: [row11] });
        interaction.reply({ embeds: [basarili], components: [row1] });

        db.set(`log_${interaction.guild.id}`, log.id);
        db.set(`botRol_${interaction.guild.id}`, botRol.id);
        db.set(`devRol_${interaction.guild.id}`, devRol.id);
        db.set(`adminRol_${interaction.guild.id}`, adminRol.id);
        db.set(`onay_${interaction.guild.id}`, onay.id);
        db.set(`botekle_${interaction.guild.id}`, botekle.id);
        db.set(`ayrildiLog_${interaction.guild.id}`, ayrildiLog.id);
        db.set(`botSira_${interaction.guild.id}`, 1);
    }
};

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isModalSubmit()) return;

    const customId = interaction.customId;

    if (interaction.isButton()) {
        if (customId.startsWith('botlist_botekle_everyone')) {
            const modal = new Discord.ModalBuilder()
                .setCustomId('botlist_botekle_modal')
                .setTitle('Bot Ekle');

            const botIdInput = new Discord.TextInputBuilder()
                .setCustomId('botlist_bot_id')
                .setLabel('Bot ID')
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true);

            const botPrefixInput = new Discord.TextInputBuilder()
                .setCustomId('botlist_bot_prefix')
                .setLabel('Bot Prefix')
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true);

            const row1 = new Discord.ActionRowBuilder().addComponents(botIdInput);
            const row2 = new Discord.ActionRowBuilder().addComponents(botPrefixInput);

            modal.addComponents(row1, row2);

            await interaction.showModal(modal);
        } else {


            if (customId.startsWith('botlist_onayla_')) {
                const adminRol = db.fetch(`adminRol_${interaction.guild.id}`);
                if (!interaction.member.roles.cache.has(adminRol)) {
                    return interaction.reply({ content: 'Bu butonu kullanmak için yetkili rolüne sahip olmalısın!', ephemeral: true });
                }
                const botId = customId.split('_')[2];
                const botRol = db.fetch(`botRol_${interaction.guild.id}`);
                const devRol = db.fetch(`devRol_${interaction.guild.id}`);
                const userId = db.fetch(`botOwner_${botId}`);

                try {
                    const member = await interaction.guild.members.fetch(userId).catch(() => null);
                    const botMember = await interaction.guild.members.fetch(botId).catch(() => null);

                    if (!member) {
                        return interaction.reply({ content: `Kullanıcı sunucuda bulunamadı.`, ephemeral: true });
                    }

                    if (!botMember) {
                        return interaction.reply({ content: `Bot sunucuda bulunamadı.`, ephemeral: true });
                    }
                    await botMember.roles.add(botRol);
                    await member.roles.add(devRol);

                    await interaction.reply({ content: 'Bot başarıyla eklendi ve roller verildi!', ephemeral: true });
                    const botInviteLink = `https://discord.com/oauth2/authorize?client_id=${botId}&scope=bot&permissions=0`;

                    const logKanal = db.fetch(`log_${interaction.guild.id}`);
                    const logEmbed = new Discord.EmbedBuilder()
                        .setColor('Green')
                        .setTitle('Bot Eklendi')
                        .setDescription(`Bot ID: <@${botId}>\nEkleyen: <@${userId}>\n Davet Linki:[buraya tıklayın](${botInviteLink})`)
                        .setFooter({ text: 'Botlist Sistemi' });

                    await client.channels.cache.get(logKanal).send({ embeds: [logEmbed] });
                } catch (error) {
                    console.error(error);
                    await interaction.reply({ content: 'Bot eklenirken bir hata oluştu.', ephemeral: true });
                }
            } else if (customId.startsWith('botlist_ayarlar_')) {
                const adminRol = db.fetch(`adminRol_${interaction.guild.id}`);
                if (!interaction.member.roles.cache.has(adminRol)) {
                    return interaction.reply({ content: 'Bu butonu kullanmak için yetkili rolüne sahip olmalısın!', ephemeral: true });
                }
                const menu = new Discord.StringSelectMenuBuilder()
                    .setCustomId('select_ayarlar')
                    .setPlaceholder('Bir ayar seçin...')
                    .addOptions([
                        { label: 'Botlist Log Kanalını Ayarla', value: 'set_botlist_log' },
                        { label: 'Bot Rolünü Ayarla', value: 'set_bot_rol' },
                        { label: 'Developer Rolünü Ayarla', value: 'set_dev_rol' },
                        { label: 'Yetkili Rolünü Ayarla', value: 'set_admin_rol' },
                        { label: 'Onay Kanalını Ayarla', value: 'set_onay_kanal' },
                        { label: 'Bot Ekle Kanalını Ayarla', value: 'set_botekle_kanal' },
                        { label: 'Ayrıldı Log Kanalını Ayarla', value: 'set_ayrildi_log' },
                    ]);

                const row = new Discord.ActionRowBuilder().addComponents(menu);
                await interaction.reply({ content: 'Ayarlar menüsü:', components: [row], ephemeral: true });
            } else if (customId.startsWith('botlist_kapat_')) {
                const adminRol = db.fetch(`adminRol_${interaction.guild.id}`);
                if (!interaction.member.roles.cache.has(adminRol)) {
                    return interaction.reply({ content: 'Bu butonu kullanmak için yetkili rolüne sahip olmalısın!', ephemeral: true });
                }
                db.delete(`log_${interaction.guild.id}`);
                db.delete(`botRol_${interaction.guild.id}`);
                db.delete(`devRol_${interaction.guild.id}`);
                db.delete(`adminRol_${interaction.guild.id}`);
                db.delete(`onay_${interaction.guild.id}`);
                db.delete(`botekle_${interaction.guild.id}`);
                db.delete(`ayrildiLog_${interaction.guild.id}`);
                db.delete(`botSira_${interaction.guild.id}`);

                await interaction.reply({ content: 'Botlist sistemi başarıyla sıfırlandı!', ephemeral: true });
            } else if (customId.startsWith('botlist_reddet_')) {
                const adminRol = db.fetch(`adminRol_${interaction.guild.id}`);
                if (!interaction.member.roles.cache.has(adminRol)) {
                    return interaction.reply({ content: 'Bu butonu kullanmak için yetkili rolüne sahip olmalısın!', ephemeral: true });
                }
                const botId = customId.split('_')[2];
                const userId = db.fetch(`botOwner_${botId}`);

                try {
                    const member = await interaction.guild.members.fetch(userId);
                    await member.send(`Botunuz reddedildi. Bot ID: ${botId}`);
                    await interaction.reply({ content: 'Bot başarıyla reddedildi ve sahibine bildirim gönderildi!', ephemeral: true });

                    const logKanal = db.fetch(`log_${interaction.guild.id}`);
                    const logEmbed = new Discord.EmbedBuilder()
                        .setColor('Red')
                        .setTitle('Bot Reddedildi')
                        .setDescription(`Bot ID: ${botId}\nEkleyen: <@${userId}>`)
                        .setFooter({ text: 'Botlist Sistemi' });

                    await client.channels.cache.get(logKanal).send({ embeds: [logEmbed] });
                } catch (error) {
                    console.error(error);
                    await interaction.reply({ content: 'Bot reddedilirken bir hata oluştu.', ephemeral: true });
                }
            } else if (customId.startsWith('botlist_testet_')) {
                const botId = customId.split('_')[2];
                const botInviteLink = `https://discord.com/oauth2/authorize?client_id=${botId}&scope=bot&permissions=0`;

                await interaction.reply({ content: `Botu test etmek için [buraya tıklayın](${botInviteLink})`, ephemeral: true });
            } else if (customId.startsWith('botlist_bilgilendirme_')) {
                const adminRol = db.fetch(`adminRol_${interaction.guild.id}`);
                if (!interaction.member.roles.cache.has(adminRol)) {
                    return interaction.reply({ content: 'Bu butonu kullanmak için yetkili rolüne sahip olmalısın!', ephemeral: true });
                }
                const bilgilendirmeEmbed = new Discord.EmbedBuilder()
                    .setColor("Yellow")
                    .setTitle("Bot-List Sistemi")
                    .setDescription("Bot-List Sistemi Bilgilendirme")
                    .addFields(
                        {
                            name: "ㅤㅤ",
                            value: "```ansi\n[2;34mBot Ekle [2;37mButonuna basılıp bir bot ekleme isteği oluşturulduğunda:\n\n[2;32m1- [2;37mBot test sunucusuna eklenip test edilir.\n[2;32m2- [2;37mTestlerden geçen botların onaylancağına karar verilirse öncelikle bot sunucuya eklenir.\n[0m[2;32m[0m[2;37m[0m[2;32m3- [2;37mBot sunucunuya eklendikten sonra onaylandı butonuna tıklanır.\n[2;32m4-[0m[2;37m Bot reddedilirse Reddet butonuna tıklanır ve kullanıcıya özel mesaj olarak reddedilir.[0m[2;32m[0m[2;37m[0m[2;34m[0m\n```"
                        }
                    )
                    .setFooter({ text: "Bot-List Sistemi" });

                await interaction.reply({ embeds: [bilgilendirmeEmbed], ephemeral: true });
            }
        }
    } else if (interaction.isStringSelectMenu() && interaction.customId === 'select_ayarlar') {
        const selectedValue = interaction.values[0];
        let modal;

        switch (selectedValue) {
            case 'set_botlist_log':
                modal = new Discord.ModalBuilder()
                    .setCustomId('modal_set_botlist_log')
                    .setTitle('Botlist Log Kanalını Ayarla');

                const logChannelInput = new Discord.TextInputBuilder()
                    .setCustomId('input_log_channel')
                    .setLabel('Log Kanalı ID')
                    .setStyle(Discord.TextInputStyle.Short)
                    .setRequired(true);

                modal.addComponents(new Discord.ActionRowBuilder().addComponents(logChannelInput));
                break;

            case 'set_bot_rol':
                modal = new Discord.ModalBuilder()
                    .setCustomId('modal_set_bot_rol')
                    .setTitle('Bot Rolünü Ayarla');

                const botRoleInput = new Discord.TextInputBuilder()
                    .setCustomId('input_bot_role')
                    .setLabel('Bot Rolü ID')
                    .setStyle(Discord.TextInputStyle.Short)
                    .setRequired(true);

                modal.addComponents(new Discord.ActionRowBuilder().addComponents(botRoleInput));
                break;

            case 'set_dev_rol':
                modal = new Discord.ModalBuilder()
                    .setCustomId('modal_set_dev_rol')
                    .setTitle('Developer Rolünü Ayarla');

                const devRoleInput = new Discord.TextInputBuilder()
                    .setCustomId('input_dev_role')
                    .setLabel('Developer Rolü ID')
                    .setStyle(Discord.TextInputStyle.Short)
                    .setRequired(true);

                modal.addComponents(new Discord.ActionRowBuilder().addComponents(devRoleInput));
                break;

            case 'set_admin_rol':
                modal = new Discord.ModalBuilder()
                    .setCustomId('modal_set_admin_rol')
                    .setTitle('Yetkili Rolünü Ayarla');

                const adminRoleInput = new Discord.TextInputBuilder()
                    .setCustomId('input_admin_role')
                    .setLabel('Yetkili Rolü ID')
                    .setStyle(Discord.TextInputStyle.Short)
                    .setRequired(true);

                modal.addComponents(new Discord.ActionRowBuilder().addComponents(adminRoleInput));
                break;

            case 'set_onay_kanal':
                modal = new Discord.ModalBuilder()
                    .setCustomId('modal_set_onay_kanal')
                    .setTitle('Onay Kanalını Ayarla');

                const onayChannelInput = new Discord.TextInputBuilder()
                    .setCustomId('input_onay_channel')
                    .setLabel('Onay Kanalı ID')
                    .setStyle(Discord.TextInputStyle.Short)
                    .setRequired(true);

                modal.addComponents(new Discord.ActionRowBuilder().addComponents(onayChannelInput));
                break;

            case 'set_botekle_kanal':
                modal = new Discord.ModalBuilder()
                    .setCustomId('modal_set_botekle_kanal')
                    .setTitle('Bot Ekle Kanalını Ayarla');

                const botekleChannelInput = new Discord.TextInputBuilder()
                    .setCustomId('input_botekle_channel')
                    .setLabel('Bot Ekle Kanalı ID')
                    .setStyle(Discord.TextInputStyle.Short)
                    .setRequired(true);

                modal.addComponents(new Discord.ActionRowBuilder().addComponents(botekleChannelInput));
                break;

            case 'set_ayrildi_log':
                modal = new Discord.ModalBuilder()
                    .setCustomId('modal_set_ayrildi_log')
                    .setTitle('Ayrıldı Log Kanalını Ayarla');

                const ayrildiLogChannelInput = new Discord.TextInputBuilder()
                    .setCustomId('input_ayrildi_log_channel')
                    .setLabel('Ayrıldı Log Kanalı ID')
                    .setStyle(Discord.TextInputStyle.Short)
                    .setRequired(true);

                modal.addComponents(new Discord.ActionRowBuilder().addComponents(ayrildiLogChannelInput));
                break;
        }

        await interaction.showModal(modal);
    } else if (interaction.isModalSubmit()) {
        const modalId = interaction.customId;

        switch (modalId) {
            case 'modal_set_botlist_log':
                const logChannelId = interaction.fields.getTextInputValue('input_log_channel');
                try {
                    const logChannel = await interaction.guild.channels.fetch(logChannelId);
                    if (logChannel) {
                        db.set(`log_${interaction.guild.id}`, logChannelId);
                        await interaction.reply({ content: `Log kanalı başarıyla ${logChannel} olarak ayarlandı!`, ephemeral: true });
                    } else {
                        await interaction.reply({ content: 'Geçersiz kanal ID\'si.', ephemeral: true });
                    }
                } catch (error) {
                    await interaction.reply({ content: 'Kanal bulunamadı.', ephemeral: true });
                }
                break;

            case 'modal_set_bot_rol':
                const botRoleId = interaction.fields.getTextInputValue('input_bot_role');
                try {
                    const botRole = await interaction.guild.roles.fetch(botRoleId);
                    if (botRole) {
                        db.set(`botRol_${interaction.guild.id}`, botRoleId);
                        await interaction.reply({ content: `Bot rolü başarıyla ${botRole} olarak ayarlandı!`, ephemeral: true });
                    } else {
                        await interaction.reply({ content: 'Geçersiz rol ID\'si.', ephemeral: true });
                    }
                } catch (error) {
                    await interaction.reply({ content: 'Rol bulunamadı.', ephemeral: true });
                }
                break;

            case 'modal_set_dev_rol':
                const devRoleId = interaction.fields.getTextInputValue('input_dev_role');
                try {
                    const devRole = await interaction.guild.roles.fetch(devRoleId);
                    if (devRole) {
                        db.set(`devRol_${interaction.guild.id}`, devRoleId);
                        await interaction.reply({ content: `Developer rolü başarıyla ${devRole} olarak ayarlandı!`, ephemeral: true });
                    } else {
                        await interaction.reply({ content: 'Geçersiz rol ID\'si.', ephemeral: true });
                    }
                } catch (error) {
                    await interaction.reply({ content: 'Rol bulunamadı.', ephemeral: true });
                }
                break;

            case 'modal_set_admin_rol':
                const adminRoleId = interaction.fields.getTextInputValue('input_admin_role');
                try {
                    const adminRole = await interaction.guild.roles.fetch(adminRoleId);
                    if (adminRole) {
                        db.set(`adminRol_${interaction.guild.id}`, adminRoleId);
                        await interaction.reply({ content: `Yetkili rolü başarıyla ${adminRole} olarak ayarlandı!`, ephemeral: true });
                    } else {
                        await interaction.reply({ content: 'Geçersiz rol ID\'si.', ephemeral: true });
                    }
                } catch (error) {
                    await interaction.reply({ content: 'Rol bulunamadı.', ephemeral: true });
                }
                break;

            case 'modal_set_onay_kanal':
                const onayChannelId = interaction.fields.getTextInputValue('input_onay_channel');
                try {
                    const onayChannel = await interaction.guild.channels.fetch(onayChannelId);
                    if (onayChannel) {
                        db.set(`onay_${interaction.guild.id}`, onayChannelId);
                        await interaction.reply({ content: `Onay kanalı başarıyla ${onayChannel} olarak ayarlandı!`, ephemeral: true });
                    } else {
                        await interaction.reply({ content: 'Geçersiz kanal ID\'si.', ephemeral: true });
                    }
                } catch (error) {
                    await interaction.reply({ content: 'Kanal bulunamadı.', ephemeral: true });
                }
                break;

            case 'modal_set_botekle_kanal':
                const botekleChannelId = interaction.fields.getTextInputValue('input_botekle_channel');
                try {
                    const botekleChannel = await interaction.guild.channels.fetch(botekleChannelId);
                    if (botekleChannel) {
                        db.set(`botekle_${interaction.guild.id}`, botekleChannelId);
                        await interaction.reply({ content: `Bot ekle kanalı başarıyla ${botekleChannel} olarak ayarlandı!`, ephemeral: true });
                    } else {
                        await interaction.reply({ content: 'Geçersiz kanal ID\'si.', ephemeral: true });
                    }
                } catch (error) {
                    await interaction.reply({ content: 'Kanal bulunamadı.', ephemeral: true });
                }
                break;

            case 'modal_set_ayrildi_log':
                const ayrildiLogChannelId = interaction.fields.getTextInputValue('input_ayrildi_log_channel');
                try {
                    const ayrildiLogChannel = await interaction.guild.channels.fetch(ayrildiLogChannelId);
                    if (ayrildiLogChannel) {
                        db.set(`ayrildiLog_${interaction.guild.id}`, ayrildiLogChannelId);
                        await interaction.reply({ content: `Ayrıldı log kanalı başarıyla ${ayrildiLogChannel} olarak ayarlandı!`, ephemeral: true });
                    } else {
                        await interaction.reply({ content: 'Geçersiz kanal ID\'si.', ephemeral: true });
                    }
                } catch (error) {
                    await interaction.reply({ content: 'Kanal bulunamadı.', ephemeral: true });
                }
                break;
        }
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.type === Discord.InteractionType.ModalSubmit) {
        if (interaction.customId === 'botlist_botekle_modal') {
            const botId = interaction.fields.getTextInputValue('botlist_bot_id');
            const botPrefix = interaction.fields.getTextInputValue('botlist_bot_prefix');
            const sira = db.fetch(`botSira_${interaction.guild.id}`);
            const botInviteLink = `https://discord.com/oauth2/authorize?client_id=${botId}&scope=bot&permissions=0`;

            const embed = new Discord.EmbedBuilder()
                .setColor('Blue')
                .setTitle('Yeni Bot Eklendi')
                .setDescription(`Bot ID: ${botId}\nBot Prefix: ${botPrefix}\nEkleyen: <@${interaction.user.id}>\n\n[Botu Davet Et](${botInviteLink})`)
                .setFooter({ text: 'Botlist Sistemi' });

            const logKanal = db.fetch(`log_${interaction.guild.id}`);
            const Onay = db.fetch(`onay_${interaction.guild.id}`);

            db.set(`botOwner_${botId}`, interaction.user.id);

            const row = new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.ButtonBuilder()
                        .setLabel('Onaylandı')
                        .setStyle(Discord.ButtonStyle.Success)
                        .setCustomId(`botlist_onayla_${botId}`)
                )
                .addComponents(
                    new Discord.ButtonBuilder()
                        .setLabel('Reddet')
                        .setStyle(Discord.ButtonStyle.Danger)
                        .setCustomId(`botlist_reddet_${botId}`)
                )
                .addComponents(
                    new Discord.ButtonBuilder()
                        .setLabel('Davet Linki')
                        .setStyle(Discord.ButtonStyle.Link)
                        .setURL(botInviteLink)
                );

            try {
                await interaction.reply({ content: 'Bot ekleme talebiniz alındı!', ephemeral: true });
                await client.channels.cache.get(Onay).send({ embeds: [embed], components: [row] });
                await client.channels.cache.get(logKanal).send({ content: `Bot ekleme talebi alındı! Bot Sıra No: ${sira}`, embeds: [embed] });

                db.set(`botSira_${interaction.guild.id}`, sira + 1);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'Bir hata oluştu. Tekrar deneyin.', ephemeral: true });
            }
        }
    }
});

