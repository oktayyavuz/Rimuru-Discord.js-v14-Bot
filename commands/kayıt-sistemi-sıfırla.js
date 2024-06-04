const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb");
const config = require("../config.json");

module.exports = {
    name: "kayıt-sistemi-sıfırla",
    description: "Kayıt sistemini sıfırlarsın!",
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
        const kayıtSistemiDate = db.fetch(`kayıtsistemiDate_${guild.id}`);

        if (!kayitSistemi || !kayıtSistemiDate) {
            const yok = new EmbedBuilder()
                .setColor("Red")
                .setDescription("❌ | Kayıt sistemi zaten ayarlanmamış!");
            return interaction.reply({ embeds: [yok], ephemeral: true });
        }

        db.delete(`kayıtsistemi_${guild.id}`);
        db.delete(`kayıtsistemiDate_${guild.id}`);

        const basarili = new EmbedBuilder()
            .setColor("Green")
            .setDescription("✅ | __**Kayıt Sistemi**__ başarıyla sıfırlandı!");
        
        return interaction.reply({ embeds: [basarili], ephemeral: false });
    }
};