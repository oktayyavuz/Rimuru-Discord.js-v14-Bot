const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    name:"sil",
    description: ' Sohbette istediğin kadar mesajı silersin!',
    type:1,
    options: [
        {
            name:"sayı",
            description:"Temizlencek Mesaj Sayısını Girin.",
            type:3,
            required:true
        },
    ],
    run: async(client, interaction) => {
        if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({content: "❌ | Mesajları Yönet Yetkin Yok!", ephemeral: true});
        }

        const sayi = parseInt(interaction.options.getString('sayı'));

        if (isNaN(sayi) || sayi <= 0) {
            return interaction.reply({content: "❌ | Geçerli bir sayı giriniz.", ephemeral: true});
        }

        try {
            const fetchedMessages = await interaction.channel.messages.fetch({ limit: sayi });
            const oldMessages = fetchedMessages.filter(msg => (Date.now() - msg.createdTimestamp) > 14 * 24 * 60 * 60 * 1000);

            if (oldMessages.size > 0) {
                const embed = new EmbedBuilder()
                    .setColor("Red")
                    .setDescription(`❌ | ${oldMessages.size} mesaj 14 günden eski olduğu için silinemedi. Sadece 14 günden yeni olan mesajlar silinebilir.`);
                
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            const deletedMessages = await interaction.channel.bulkDelete(sayi, true);

            const embed = new EmbedBuilder()
                .setColor("Random")
                .setDescription(`✅ | Başarıyla ${deletedMessages.size} mesajı sildim.`)
                .setImage("https://i.hizliresim.com/t7sp6n3.gif");
            
            interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            interaction.reply({content: "❌ | Mesajları silerken bir hata oluştu.", ephemeral: true});
        }
    },
};