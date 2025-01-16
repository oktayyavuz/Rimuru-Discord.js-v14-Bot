const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb");

module.exports = {
    name: "untimeout",
    description: "Kullanıcının timeout'unu kaldırırsın.",
    options: [
        {
            type: 6, // USER
            name: "kullanıcı",
            description: "Timeout'u kimin kaldırmak istersin?",
            required: true
        }
    ],
    type: 1,

    run: async (client, interaction) => {
        let data = db.get(`timeoutSistemi_${interaction.guild.id}`);

        if (!data) return interaction.reply({ content: "❌ | Dostum **__Timeout Sistemi__** ayarlanmamış.", ephemeral: true });

        let yetkili = data.yetkili;
        let kanal = data.log;

        let channel = client.channels.cache.get(kanal);
        if (!channel) return interaction.reply({ content: `❌ | Dostum **__Timeout Sistemi__** log kanalı bulunamadı.`, ephemeral: true });

        const kullanıcı = interaction.options.getMember("kullanıcı");

        const uyeYetki = new EmbedBuilder()
            .setColor("Red")
            .setDescription(`❌ | Bu komutu kullanabilmek için <@&${yetkili}> rolüne sahip olmalısın!`);

        const botYetki = new EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ | Bunu yapabilmek için yeterli yetkiye sahip değilim.");

        const uyeBulunamadi = new EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ | Belirttiğin üyeyi bulamadım.");

        const pozisyon = new EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ | Kullanıcının rolü benim rolümden yüksek.");

        const pozisyon2 = new EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ | Kullanıcının rolü senin rolünden yüksek.");

        const sunucuSahibi = new EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ | Sunucu sahibinin timeout'unu kaldıramazsın dostum.");

        const kendiniSusturma = new EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ | Kendinin timeout'unu kaldırmak mı istiyorsun?");

        const botuSusturma = new EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ | Ben bir botum, benim timeout'um zaten olamaz.");

        const hata = new EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ | Komutu kullanırken bir hata oluştu.");

        if (!interaction.member.roles.cache.has(yetkili)) return interaction.reply({ embeds: [uyeYetki], ephemeral: true });

        let me = interaction.guild.members.cache.get(client.user.id);
        if (!me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return interaction.reply({ embeds: [botYetki], ephemeral: true });

        if (!kullanıcı) return interaction.reply({ embeds: [uyeBulunamadi], ephemeral: true });
        if (interaction.guild.ownerId === kullanıcı.id) return interaction.reply({ embeds: [sunucuSahibi], ephemeral: true });
        if (interaction.user.id === kullanıcı.id) return interaction.reply({ embeds: [kendiniSusturma], ephemeral: true });
        if (client.user.id === kullanıcı.id) return interaction.reply({ embeds: [botuSusturma], ephemeral: true });

        if (interaction.guild.ownerId !== interaction.user.id) {
            if (kullanıcı.roles.highest.position >= interaction.member.roles.highest.position) return interaction.reply({ embeds: [pozisyon2], ephemeral: true });
        }

        if (kullanıcı.roles.highest.position >= me.roles.highest.position) return interaction.reply({ embeds: [pozisyon], ephemeral: true });

        try {
            await kullanıcı.timeout(null); // Timeout'u kaldırmak için null değeri gönderiyoruz
            const logMessage = new EmbedBuilder()
                .setColor("Green")
                .setTitle("✅ | Bir Üyenin Timeout'u Kaldırıldı!")
                .setDescription(`<@${interaction.user.id}> adlı yetkili <@${kullanıcı.id}> adlı kişinin timeout'unu kaldırdı!`)
                .setTimestamp()
                .setThumbnail(kullanıcı.displayAvatarURL({ dynamic: true }));

            const basarili = new EmbedBuilder()
                .setColor("Green")
                .setDescription(`✅ | ${kullanıcı} adlı kullanıcının timeout'u başarıyla kaldırıldı!`);

            await channel.send({ embeds: [logMessage] });
            await interaction.reply({ embeds: [basarili], ephemeral: false });
        } catch (error) {
            console.error(error);
            await interaction.reply({ embeds: [hata], ephemeral: true });
        }
    }
};
