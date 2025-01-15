const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb");

module.exports = {
    name: "reroll",
    description: "Bir çekilişi yeniden çeker.",
    type: 1,
    options: [
        {
            name: "mesaj_id",
            description: "Yeniden çekmek istediğiniz çekilişin mesaj ID'si",
            type: 3,
            required: true
        }
    ],
    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.reply({ content: "❌ | Çekilişi yeniden çekme yetkiniz yok!", ephemeral: true });
        }

        const mesajId = interaction.options.getString('mesaj_id');
        const çekilişData = db.get(`çekiliş_${mesajId}`);

        if (!çekilişData) {
            return interaction.reply({ content: "❌ | Belirtilen mesaj ID'sine ait bir çekiliş bulunamadı!", ephemeral: true });
        }

        const katilimcilar = new Set(çekilişData.katilimcilar);
        if (katilimcilar.size === 0) {
            return interaction.reply({ content: "❌ | Çekilişte yeterli katılımcı yok, yeniden çekim yapılamaz.", ephemeral: true });
        }

        const kazananSayisi = çekilişData.kazananSayisi;
        const ödül = çekilişData.ödül;
        const serverIcon = interaction.guild.iconURL();

        const kazananlar = Array.from(katilimcilar).sort(() => Math.random() - Math.random()).slice(0, kazananSayisi);
        const kazananListesi = kazananlar.map(id => `<@${id}>`).join(', ');

        const rerollEmbed = new EmbedBuilder()
            .setTitle("🎉 Çekiliş Yeniden Çekildi! 🎉")
            .setDescription(`Ödül: **${ödül}**\nYeni Kazananlar: ${kazananListesi}\nTebrikler!`)
            .setColor("Random")
            .setTimestamp()
            .setThumbnail(serverIcon);

        await interaction.reply({ embeds: [rerollEmbed] });

        kazananlar.forEach(async id => {
            try {
                const user = await interaction.guild.members.fetch(id);
                const dmEmbed = new EmbedBuilder()
                    .setTitle("🎉 Tebrikler! 🎉")
                    .setDescription(`Kazandığınız ödül: **${ödül}**\nSunucu: **${interaction.guild.name}**`)
                    .setColor("Random")
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
                        .setTitle('Çekiliş Yeniden Çekildi')
                        .addFields(
                            { name: 'Ödül', value: `${ödül}`, inline: true },
                            { name: 'Yeni Kazananlar', value: `${kazananListesi}`, inline: true },
                            { name: 'Çekilişi Yeniden Çeken', value: `${interaction.user}`, inline: true },
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
};
