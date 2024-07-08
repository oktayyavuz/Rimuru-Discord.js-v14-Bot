const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const Discord = require("discord.js")
const { createButton, deleteMessageButton } = require("../function/functions");
const db = require("croxydb")
module.exports = {
    name: "mute",
    description: ' Kullanıcıya Mute atarsın.',
    type: 1,
    options: [
        {
            name: "kullanıcı",
            description: "Mutelemek istediğiniz kişiyi etiketleyin!",
            type: 6,
            required: true
        },
        {
            name: "sebep",
            description: "Mute sebebini gir!",
            type: 3,
            required: true
        },
    ],
    run: async (client, interaction) => {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return interaction.reply({ content: "❌ | Rolleri Yönet Yetkin Yok!", ephemeral: true })
        const kullanıcı = interaction.options.getMember('kullanıcı')
        const sebep = interaction.options.getString('sebep')
        let mutekontrol = db.fetch(`rol_${interaction.guild.id}`)
        let kontrolmuteytkrol = db.fetch(`yetkili_${interaction.guild.id}`)
        if (!mutekontrol) return interaction.reply(`Mute Rolü ayarlanmamış!`)
        if (!kontrolmuteytkrol) return interaction.reply(`Mute Yetkilisi rolü ayarlanmamış!`)

        if (!interaction.member.roles.cache.has(db.fetch(`yetkili_${interaction.guild.id}`))) return interaction.reply(`❌ | Bu komutu sadece ayarlanan **Mute Yetkilisi** rolü olan kişiler kullanabilir.`)

        const row = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId('muteonay_'+interaction.user.id)
                    .setLabel('Onayla')
                    .setEmoji("1039607067729727519")
                    .setStyle('Success'),
                new Discord.ButtonBuilder()
                    .setCustomId('mutered_'+interaction.user.id)
                    .setLabel('İptal')
                    .setEmoji("1040649840394260510")
                    .setStyle('Danger'),

            );

        const embed = new EmbedBuilder()
            .setDescription(`
${kullanıcı}, isimli kişiye mute atmak istediğine emin misin? Mute sebebi: **${sebep ? sebep : "YOK"}**
`)
        db.set(`muteKullanici_${interaction.user.id}`, kullanıcı.id)

        interaction.reply({ embeds: [embed], components: [row] })

    }

};