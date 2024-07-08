const { Client, EmbedBuilder, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("croxydb");

module.exports = {
    name: "kayıt",
    description: "Kullanıcıyı kaydeder.",
    type: 1,
    options: [
        {
            name: "kullanıcı",
            description: "Kayıt edilecek kullanıcıyı seçin.",
            type: 6, 
            required: true,
        },
    ],
    run: async (client, interaction) => {
        const yetki = new EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ | Bu komutu kullanabilmek için `Yönetici` yetkisine sahip olmalısın!");

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ embeds: [yetki], ephemeral: true });
        }

        const hedefUye = interaction.options.getMember('kullanıcı');

        const kayitSistemi = db.fetch(`kayıtsistemi_${interaction.guild.id}`);
        if (!kayitSistemi) {
            const hata = new EmbedBuilder()
                .setColor("Red")
                .setDescription("❌ | Kayıt sistemi ayarlanmamış!");
            return interaction.reply({ embeds: [hata], ephemeral: true });
        }

        const kayıtMesajı = new EmbedBuilder()
            .setColor("Blue")
            .setTitle(`${interaction.guild.name} Sunucusunda Kayıt`)
            .setDescription(`Kayıt olmak için aşağıdaki butonlardan birine tıklayın.\n\nCreate By ${interaction.user}`);

        const kızButonu = new ButtonBuilder()
            .setCustomId("kizkayit")
            .setLabel("Kız Kayıt")
            .setStyle(ButtonStyle.Success);

        const erkekButonu = new ButtonBuilder()
            .setCustomId("erkekkayit")
            .setLabel("Erkek Kayıt")
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(kızButonu, erkekButonu);

        await interaction.reply({
            content: `${hedefUye} için kayıt seçenekleri:`,
            embeds: [kayıtMesajı],
            components: [row],
            ephemeral: true,
        });
    }
};

client.on('interactionCreate', async (interaction) => {
  if (interaction.isModalSubmit()) {
        const kayitsistemi = db.fetch(`kayıtsistemi_${interaction.guild.id}`);
        if (!kayitsistemi) return;
    }
});

client.on("guildMemberRemove", async (member) => {
    db.delete(`uye_${member.id}`);
});
