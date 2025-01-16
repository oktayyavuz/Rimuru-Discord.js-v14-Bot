const { PermissionsBitField, ChannelType, EmbedBuilder } = require("discord.js");
const db = require('croxydb');
const Discord = require('discord.js');
const { Permissions } = require("discord.js")

module.exports = {
    name:"sunucu-kur",
    description: ' Otomatik Sunucu kurarsın!',
    type:1,
    options: [],
    run: async(client, interaction) => {

        if(interaction.user.id !== interaction.guild.ownerId) return interaction.reply('❌ | Bu komutu sadece **sunucu sahibi** kullanabilir!')

        if (interaction.guild.features.includes('COMMUNITY')) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Hata')
                .setDescription('Bu sunucu bir Topluluk sunucusu olduğu için bu işlemi gerçekleştiremiyorum.')
            
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        const row = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId('sunucukuronay_'+interaction.user.id)
                    .setLabel('Onayla')
                    .setEmoji("1039607067729727519")
                    .setStyle('Success'),
                new Discord.ButtonBuilder()
                    .setCustomId('sunucukurred_'+interaction.user.id)
                    .setLabel('İptal')
                    .setEmoji("1040649840394260510")
                    .setStyle('Danger'),
            );

        const embed = new EmbedBuilder()
            .setDescription(`Sunucuyu kurmak istediğinden emin misin? Sunucudaki bütün kanallar ve roller silinecek.`)

        interaction.reply({ embeds: [embed], components: [row] })
    }
};