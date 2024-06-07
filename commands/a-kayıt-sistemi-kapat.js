const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb");
const config = require("../config.json");

module.exports = {
    name: "kayıt-sistemi-kapat",
    description: "Kayıt sistemini devre dışı bırakırsın!",
    type: 1,
    run: async (client, interaction) => {
        const { user, guild } = interaction;

        const yetki = new EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ | Bu komutu kullanabilmek için `Yönetici` yetkisine sahip olmalısın!");

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ embeds: [yetki], ephemeral: true });
        }

        const kayitSistemi = db.fetch(`kayıtsistemi_${guild.id}`);
        if (!kayitSistemi) {
            const yok = new EmbedBuilder()
                .setColor("Red")
                .setDescription("❌ | Kayıt sistemi zaten devre dışı!");
            return interaction.reply({ embeds: [yok], ephemeral: true });
        }

        db.delete(`kayıtsistemi_${guild.id}`);

        const basarili = new EmbedBuilder()
            .setColor("Green")
            .setDescription("✅ | __**Kayıt Sistemi**__ başarıyla devre dışı bırakıldı!");
        
        return interaction.reply({ embeds: [basarili], ephemeral: false });
    }
};
