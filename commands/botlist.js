const Discord = require("discord.js")
const db = require("croxydb");
const { messageLink } = require("discord.js");

module.exports = {
    name: "botlist-ayarla",
    description: " Botlist sistemini ayarlarsınız!",
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
            description: "Botlist log kanalını ayarlarsınız!",
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

        const yetki = new Discord.EmbedBuilder()
            .setColor("Red")
            .setTitle("Yetersiz Yetki!")
            .setDescription("<❌ | > Bu komutu kullanabilmek için `Yönetici` yetkisine sahip olmalısın!")
            .setFooter({ text: "Dyto" })

        if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) return interaction.reply({ embeds: [yetki], ephemeral: true })

        const log = interaction.options.getChannel('botlist-log')
        const botRol = interaction.options.getRole('bot-rolü')
        const devRol = interaction.options.getRole('developer-rolü')
        const adminRol = interaction.options.getRole('yetkili-rolü')
        const onay = interaction.options.getChannel('onay-kanalı')
        const botekle = interaction.options.getChannel('botekle-kanalı')
        const ayrildiLog = interaction.options.getChannel('ayrıldı-log')

        const row1 = new Discord.ActionRowBuilder()

            .addComponents(
                new Discord.ButtonBuilder()
                    .setEmoji("1039607040898781325")
                    .setLabel("Ayarlar")
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setCustomId("ayarlar_"+interaction.user.id)
            )

            .addComponents(
                new Discord.ButtonBuilder()
                    .setEmoji("1039607063443161158")
                    .setLabel("Sistemi Sıfırla")
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setCustomId("kapat_"+interaction.user.id)
            )

        const basarili = new Discord.EmbedBuilder()
            .setColor("Green")
            .setTitle("✅ | Başarıyla Ayarlandı!")
            .setDescription("✅ | Botlist sistemi başarıyla ayarlandı!")
            .setFooter({ text: "Dyto" })


            const menu = new Discord.EmbedBuilder()
            .setColor("000000")
            .setTitle("<❔ | Botumu Nasıl Eklerim?")
            .setDescription("> Aşağıdaki **Bot Ekle** butonuna basarak botunu ekleyebilirsin!")
            .setFooter({ text: "Dyto" })
  
        const row11 = new Discord.ActionRowBuilder()
  
            .addComponents(
                new Discord.ButtonBuilder()
                    .setEmoji("1039607042291269703")
                    .setLabel("Bot Ekle")
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setCustomId("botekle_everyone")
            )

            botekle.send({ embeds: [menu], components: [row11] })
        interaction.reply({ embeds: [basarili], components: [row1] })

        db.set(`log_${interaction.guild.id}`, log.id)
        db.set(`botRol_${interaction.guild.id}`, botRol.id)
        db.set(`devRol_${interaction.guild.id}`, devRol.id)
        db.set(`adminRol_${interaction.guild.id}`, adminRol.id)
        db.set(`onay_${interaction.guild.id}`, onay.id)
        db.set(`botekle_${interaction.guild.id}`, botekle.id)
        db.set(`ayrildiLog_${interaction.guild.id}`, ayrildiLog.id)
		db.set(`botSira_${interaction.guild.id}`, 1)
    }
}