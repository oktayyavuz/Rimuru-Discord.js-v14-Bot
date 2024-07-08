const { Client, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("croxydb");
const ms = require("ms");

module.exports = {
    name: "çekiliş",
    description: "Bir çekiliş başlatır.",
    type: 1,
    options: [
        {
            name: "ödül",
            description: "Çekilişin ödülü nedir?",
            type: 3,
            required: true
        },
        {
            name: "süre",
            description: "Çekilişin süresi (örneğin: 1m, 1h, 1d)",
            type: 3,
            required: true
        },
        {
            name: "kazanan_sayisi",
            description: "Çekilişi kazanacak kişi sayısı",
            type: 4,
            required: true
        }
    ],
    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.reply({ content: "❌ | Çekiliş başlatma yetkiniz yok!", ephemeral: true });
        }

        const ödül = interaction.options.getString('ödül');
        const süre = interaction.options.getString('süre');
        const kazananSayisi = interaction.options.getInteger('kazanan_sayisi');

        const süreMs = ms(süre);
        if (!süreMs) {
            return interaction.reply({ content: "❌ | Geçersiz süre formatı! Lütfen doğru bir süre girin (örneğin: 1m, 1h, 1d).", ephemeral: true });
        }

        const bitişZamanı = Date.now() + süreMs;
        const serverIcon = interaction.guild.iconURL();

        const embed = new EmbedBuilder()
            .setTitle("🎉 Çekiliş Başladı! 🎉")
            .setDescription(`Ödül: **${ödül}**\nSüre: **<t:${Math.floor(bitişZamanı / 1000)}:R>**\nKazancak üye sayısı: ${kazananSayisi}\nKatılmak için aşağıdaki 🎉 butonuna tıklayın!`)
            .setColor("Random")
            .setImage("https://i.hizliresim.com/d7vr6rv.gif")
            .setTimestamp()
            .setThumbnail(serverIcon);

        const katilButton = new ButtonBuilder()
            .setCustomId('katil')
            .setLabel('Katıl 🎉')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder()
            .addComponents(katilButton);

        const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

        db.set(`çekiliş_${msg.id}`, {
            ödül,
            kazananSayisi,
            katilimcilar: [],
            bitis: bitişZamanı
        });

        const filter = i => i.customId === 'katil';
        const collector = msg.createMessageComponentCollector({ filter, time: süreMs });

        collector.on('collect', async i => {
            if (i.customId === 'katil') {
                const çekilişData = db.get(`çekiliş_${msg.id}`);
                çekilişData.katilimcilar.push(i.user.id);
                db.set(`çekiliş_${msg.id}`, çekilişData);
                await i.reply({ content: "Çekilişe katıldınız! 🎉", ephemeral: true });
            }
        });

        collector.on('end', async () => {
            const çekilişData = db.get(`çekiliş_${msg.id}`);
            await cekilisYap(new Set(çekilişData.katilimcilar), çekilişData.kazananSayisi, çekilişData.ödül, interaction, serverIcon);
        });
    }
};

async function cekilisYap(katilimcilar, kazananSayisi, ödül, interaction, serverIcon) {
    if (katilimcilar.size === 0) {
        return interaction.followUp({ content: "❌ | Yeterli katılımcı yok, çekiliş iptal edildi." });
    }

    const kazananlar = Array.from(katilimcilar).sort(() => Math.random() - Math.random()).slice(0, kazananSayisi);
    const kazananListesi = kazananlar.map(id => `<@${id}>`).join(', ');

    const winnerEmbed = new EmbedBuilder()
        .setTitle("🎉 Çekiliş Sona Erdi! 🎉")
        .setDescription(`Ödül: **${ödül}**\nKazananlar: ${kazananListesi}\nTebrikler!`)
        .setColor("Random")
        .setImage("https://i.hizliresim.com/mv9iwzl.gif")
        .setTimestamp()
        .setThumbnail(serverIcon);

    await interaction.followUp({ embeds: [winnerEmbed] });

    kazananlar.forEach(async id => {
        try {
            const user = await interaction.guild.members.fetch(id);
            const dmEmbed = new EmbedBuilder()
                .setTitle("🎉 Tebrikler! 🎉")
                .setDescription(`Kazandığınız ödül: **${ödül}**\nSunucu: **${interaction.guild.name}**`)
                .setColor("Random")
                .setImage("https://i.hizliresim.com/mv9iwzl.gif")
                .setTimestamp()
                .setThumbnail(serverIcon);

            await user.send({ embeds: [dmEmbed] });
        } catch (err) {
            console.error('Kazanana özel mesaj gönderilemedi:', err);
        }
    });

    try {
        const modLogChannelId = db.get(`modlogK_${interaction.guild.id}`);
        if (modLogChannelId) {
            const modLogChannel = interaction.client.channels.cache.get(modLogChannelId);
            if (modLogChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('Çekiliş Tamamlandı')
                    .addFields(
                        { name: 'Ödül', value: `${ödül}`, inline: true },
                        { name: 'Kazananlar', value: `${kazananListesi}`, inline: true },
                        { name: 'Çekilişi Başlatan', value: `${interaction.user}`, inline: true },
                    )
                    .setTimestamp()
                    .setThumbnail(serverIcon);

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
}