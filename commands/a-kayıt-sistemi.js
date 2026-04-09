const { Client, EmbedBuilder, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("croxydb");
const Discord = require("discord.js");
const config = require("../config.json");
const botsahip = `<@${config["sahip"]}>`;

module.exports = {
    name: "kayıt-sistemi",
    description: "Kayıt sistemini ayarlarsın!",
    type: 1,
    options: [
        {
            name: "kayıt-kanalı",
            description: "Kayıt kanalını ayarlarsın!",
            type: 7,
            required: true,
            channel_types: [0]
        },
        {
            name: "kayıt-yetkilisi",
            description: "Kayıt yetkilisi rolünü ayarlarsın!",
            type: 8,
            required: true,
        },
        {
            name: "kız-rol",
            description: "Kız rolünü ayarlarsın!",
            type: 8,
            required: true,
        },
        {
            name: "erkek-rol",
            description: "Erkek rolünü ayarlarsın!",
            type: 8,
            required: true,
        },
        {
            name: "kayıtsız-rol",
            description: "Kayıtsız rolünü ayarlarsın!",
            type: 8,
            required: true,
        },
    ],
    run: async (client, interaction) => {
        const { user, customId, guild } = interaction;
        const yetki = new EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ | Bu komutu kullanabilmek için `Yönetici` yetkisine sahip olmalısın!");

        const kayıtkanal = interaction.options.getChannel('kayıt-kanalı');
        const kayityetkilisi = interaction.options.getRole('kayıt-yetkilisi');
        const kızrol = interaction.options.getRole('kız-rol');
        const erkekrol = interaction.options.getRole('erkek-rol');
        const kayıtsızrol = interaction.options.getRole('kayıtsız-rol');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ embeds: [yetki], ephemeral: true });

        const kayitSistemi = db.fetch(`kayıtsistemi_${interaction.guild.id}`);
        const kayıtSistemiDate = db.fetch(`kayıtsistemiDate_${interaction.guild.id}`);

        if (kayitSistemi && kayıtSistemiDate) {
            const date = new EmbedBuilder()
                .setDescription(`❌ | Bu sistem <t:${parseInt(kayıtSistemiDate.date / 1000)}:R> önce açılmış!`);
            return interaction.reply({ embeds: [date] });
        }

        const basarili = new EmbedBuilder()
            .setColor("Random")
            .setDescription(`✅ | __**Kayıt Sistemi**__ başarıyla ayarlandı!\n\n ***#*** |  Kayıt Kanalı: ${kayıtkanal}\n🤖 Kayıt Yetkilisi Rolü: ${kayityetkilisi}\n🤖 Kız Rolü: ${kızrol}\n🤖 Erkek Rolü: ${erkekrol}\n🤖 Kayıtsız Rolü: ${kayıtsızrol}`);
        
        db.set(`kayıtsistemi_${interaction.guild.id}`, { kayıtkanal: kayıtkanal.id, kayityetkilisi: kayityetkilisi.id, kızrol: kızrol.id, erkekrol: erkekrol.id, kayıtsızrol: kayıtsızrol.id });
        db.set(`kayıtsistemiDate_${interaction.guild.id}`, { date: Date.now() });

        return interaction.reply({ embeds: [basarili], ephemeral: false }).catch((e) => { });
    }
};

