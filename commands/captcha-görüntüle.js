const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb")
const Discord = require("discord.js")
module.exports = {
    name: "captcha-görüntüle",
    description: " Captcha istatistiklerini görüntülersin!",
    type: 1,
    options: [],
    // 
    run: async (client, interaction) => {

        const { user, customId, guild } = interaction;
        const yetki = new Discord.EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ | Bu komutu kullanabilmek için `Yönetici` yetkisine sahip olmalısın!")

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ embeds: [yetki], ephemeral: true })

        if(!`rcaptchaOnaylılar_${interaction.guild.id}`)
        {
          db.set(`rcaptchaOnaylılar_${interaction.guild.id}`, [])
        }
  
      
      if(!db.fetch(`rcaptcha_${interaction.guild.id}`))
        {
          return interaction.reply({ embeds: [
                new Discord.EmbedBuilder()
                .setColor("#36393F")
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true })})
                .setDescription(':x: **|** rCaptcha doğrulama sistemi `pasif` iken bu işlem yapılamaz.')
              ], fetchReply: true });
        }
      
      const array = db.fetch(`rcaptchaOnaylılar_${interaction.guild.id}`).length || 0;
      return interaction.reply({ embeds: [
                new Discord.EmbedBuilder()
                .setColor("#36393F")
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true })})
                .setDescription('✅ **|** rCaptcha doğrulama sistemini kullandığın için teşekkürler.')
                .addFields(
                  { name: 'Doğrulanmamış üyeler:', value: '```css\n'+(interaction.guild.memberCount - array)+'\n```', inline: true },
                  { name: 'Doğrulanmış üyeler:', value: '```css\n'+array+'\n```', inline: true },
                )  
              ], fetchReply: true });

    }

};