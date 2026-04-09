const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const dbManager = require('../helpers/database');
const config = require('../config.json');

module.exports = {
    name: "messageCreate",
    once: false,
    run: async (client, message) => {
        try {
            if (message.author.bot || !message.guild) return;

            const guildId = message.guild.id;
            const content = message.content.toLowerCase();

            // Kara liste kontrolü
            const blacklistedUsers = dbManager.get('blacklistedUsers') || [];
            if (blacklistedUsers.includes(message.author.id)) return;

            const blacklistedGuilds = dbManager.get('blacklistedGuilds') || [];
            if (blacklistedGuilds.includes(guildId)) return;

            // AFK Sistemi
            const afkReason = dbManager.get(`afk_${message.author.id}`);
            if (afkReason) {
                const afkData = dbManager.get(`afkDate_${message.author.id}`);
                const date = `${message.author} Hoş geldin! **${afkReason}** sebebiyle <t:${parseInt(afkData?.date / 1000)}:R> afk'ydın.`;
                dbManager.delete(`afk_${message.author.id}`);
                dbManager.delete(`afkDate_${message.author.id}`);
                message.reply(date);
            }

            const mentionedUser = message.mentions.users.first();
            if (mentionedUser) {
                const targetAfkReason = dbManager.get(`afk_${mentionedUser.id}`);
                if (targetAfkReason) {
                    message.reply(`❔ | Etiketlediğin kullanıcı **${targetAfkReason}** sebebiyle AFK modunda!`);
                }
            }

            // Koruma Sistemleri (Sadece Adminsizler İçin)
            if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                // Küfür Engel
                const antiSwear = dbManager.get(`kufur_${guildId}`) || dbManager.get(`kufurengel_${guildId}`);
                if (antiSwear) {
                    const swearWords = ["sikik", "sikeyim", "piç", "yarrak", "oç", "göt", "orospu", "sikim", "oruspu çocugu", "amk", "aq", "amcık", "taşak"];
                    if (swearWords.some(word => content.includes(word))) {
                        await message.delete().catch(() => { });
                        const embed = new EmbedBuilder()
                            .setColor("Red")
                            .setTitle(`❗ **UYARI!**`)
                            .setDescription(`✋ | ${message.author}, Küfür etmek bu sunucuda yasaktır!`);
                        return message.channel.send({ embeds: [embed] }).then(msg => setTimeout(() => msg.delete().catch(() => { }), 5000));
                    }
                }

                // Reklam Engel
                const antiAd = dbManager.get(`reklam_${guildId}`) || dbManager.get(`reklamengel_${guildId}`);
                if (antiAd) {
                    const adPattern = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+|(\.com|\.net|\.org|\.tk|\.cf|\.gg)/i;
                    if (adPattern.test(content)) {
                        await message.delete().catch(() => { });
                        const embed = new EmbedBuilder()
                            .setColor("Red")
                            .setTitle(`❗ **UYARI!**`)
                            .setDescription(`✋ | ${message.author}, Reklam yapmak bu sunucuda yasaktır!`);
                        return message.channel.send({ embeds: [embed] }).then(msg => setTimeout(() => msg.delete().catch(() => { }), 5000));
                    }
                }

                // Capslock Engel
                const antiCaps = dbManager.get(`capslock_${guildId}`) || dbManager.get(`capslockengel_${guildId}`);
                if (antiCaps && content.length > 5) {
                    const upperCaseCount = message.content.replace(/[^A-ZĞÜŞİÖÇ]/g, '').length;
                    const totalLength = message.content.replace(/[^a-zA-ZĞÜŞİÖÇğüşıöç]/g, '').length;
                    if (totalLength > 0 && (upperCaseCount / totalLength) > 0.7) {
                        await message.delete().catch(() => { });
                        const embed = new EmbedBuilder()
                            .setColor("Orange")
                            .setTitle(`❗ **UYARI!**`)
                            .setDescription(`✋ | ${message.author}, Lütfen fazla büyük harf kullanmayın!`);
                        return message.channel.send({ embeds: [embed] }).then(msg => setTimeout(() => msg.delete().catch(() => { }), 5000));
                    }
                }
            }

            // Görsel Engel
            const mediaChannel = dbManager.get(`medyaKanal_${guildId}`) || dbManager.get(`görselengel.${guildId}`);
            if (message.channel.id === mediaChannel) {
                if (!message.attachments.first() && !message.content.includes("http")) {
                    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                        await message.delete().catch(() => { });
                        return message.channel.send(`${message.author}, Bu kanalda sadece görsel paylaşabilirsiniz.`).then(msg => setTimeout(() => msg.delete().catch(() => { }), 5000));
                    }
                }
            }

            // Özel Komutlar / Oto Yanıt
            const customCommands = dbManager.get(`customCommands_${guildId}`) || [];
            const saasEnabled = dbManager.get(`saas_${guildId}`);
            const prefix = dbManager.get(`prefix_${guildId}`) || config.prefix;

            if (saasEnabled && (content === 'sa' || content === 'as' || content === 'selam' || content === 'slm')) {
                message.reply(`as cnm la naber 😋`);
            }

            for (const cmd of customCommands) {
                const match = cmd.isRegex ? new RegExp(cmd.name, 'i').test(content) : (content === cmd.name.toLowerCase() || content === `${prefix}${cmd.name.toLowerCase()}`);
                if (match) {
                    message.channel.send(cmd.response);
                    return;
                }
            }

            // Ping Komutu (Hızlı Kontrol İçin)
            if (content === 'ping') {
                message.reply(`🏓 Pong! Bot ping: **${client.ws.ping}ms**`);
            }

        } catch (err) {
            console.error('messageCreate hatası:', err);
        }
    }
};
