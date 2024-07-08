const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");

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
        },
        {
            name: "reason",
            description: "Hangi Sebepten dolayı yasaklanıcak?",
            type: 3,
            required: true
        },
    ],
    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: "❌ | Üyeleri Yasakla Yetkin Yok!", ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return interaction.reply({ content: "❌ | Bu kullanıcı sunucuda bulunmuyor.", ephemeral: true });
        }

        if (member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: "❌ | Bu Kullanıcının Ban Yetkisi Olduğu İçin Onu Yasaklayamadım.", ephemeral: true });
        }

        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({ content: "❌ | Bu kullanıcı senden daha yüksek bir role sahip olduğu için onu yasaklayamazsın.", ephemeral: true });
        }

        try {
            await member.ban({ reason: reason });

            const embed = new EmbedBuilder()
                .setColor("Random")
                .setDescription(`✅ | Başarıyla ${user.tag} Kullanıcısını Banladım.`);

            interaction.reply({ embeds: [embed] });
        } catch (error) {
            if (error.code === 50013) {
                interaction.reply({ content: "❌ | Kullanıcıyı yasaklamak için yeterli yetkim yok.", ephemeral: true });
            } else if (error.code === 429) {
                interaction.reply({ content: "❌ | Rate limit aşıldı, lütfen daha sonra tekrar deneyin.", ephemeral: true });
            } else {
                console.error(error);
                interaction.reply({ content: "❌ | Kullanıcıyı yasaklarken bir hata oluştu.", ephemeral: true });
            }
        }
    },
};