const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const Discord = require('discord.js')
const db = require("croxydb")
const config = require("../config.json"); 

module.exports = {
    name:"giriş-çıkış-mesaj",
    description: ' Giriş Çıkış Mesajını Ayarlarsın!',
    type:1,
    options: [],
  run: async(client, interaction) => {

    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({content: "❌ | Kanalları Yönet Yetkin Yok!", ephemeral: true})
    const row1 = new Discord.ActionRowBuilder()

    .addComponents(
        new Discord.ButtonBuilder()
            .setLabel("Giriş Çıkış Mesajını Ayarla!")
            .setStyle(Discord.ButtonStyle.Primary)
            .setCustomId("giriscikismesaj_"+interaction.user.id)
    )
    .addComponents(
        new Discord.ButtonBuilder()
            .setLabel("Giriş Çıkış Mesajını Sıfırla!")
            .setStyle(Discord.ButtonStyle.Secondary)
            .setCustomId("giriscikismesajsifirla_"+interaction.user.id)
    )
    const embed = new EmbedBuilder()
    .setAuthor({ name: `${config["bot-adi"]}`, iconURL: client.user.displayAvatarURL({ dynamic: true })})
    .setDescription(`Merhaba <@${interaction.user.id}>! Giriş çıkış mesajını ayarlamak veya sıfırlamak için aşağıdaki butonları kullanabilirsin!`)
    .addFields([
        {
          name: "**{guild.memberCount}**",
          value: "`Sunucunun toplam üye sayısını gösterir.`",
          inline: false
        },
        {
          name: "**{guild.name}**",
          value: "`Sunucunun tam ismini gösterir.`",
          inline: false
        },
        {
            name: "**{member}**",
            value: "`Kullanıcının ismini gösterir.`",
            inline: false
        },
        {
          name: "**{owner.name}**",
          value: "`Sunucu kime ait ise o kişinin ismini gösterir.`",
          inline: false
        },
      ]);
    interaction.reply({ embeds: [embed], components: [row1] })
}

};
