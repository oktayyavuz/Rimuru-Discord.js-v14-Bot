const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: "interactionCreate",
  run: async (client, interaction) => {
    if (interaction.isButton()) {
        const kayitsistemi = db.fetch(`kayıtsistemi_${interaction.guild.id}`);
        if (!kayitsistemi) return;

        if (interaction.customId === "kizkayit" || interaction.customId === "erkekkayit") {
            const kayityetkilisi = kayitsistemi.kayityetkilisi;
    
            if (!interaction.member.roles.cache.has(kayityetkilisi)) {
                return interaction.reply({ content: 'Bu butonu kullanmak için yetkili rolüne sahip olmalısın!', ephemeral: true });
            }
            
            const kayitmodel = new ModalBuilder()
                .setCustomId(interaction.customId === "kizkayit" ? 'kizkayitform' : 'erkekkayitform')
                .setTitle(' - Kayıt Menüsü!');

            const isim = new TextInputBuilder()
                .setCustomId('kayitisim')
                .setLabel('İsim')
                .setStyle(TextInputStyle.Short)
                .setMinLength(2)
                .setPlaceholder('İsminiz Nedir?')
                .setRequired(true);

            const yas = new TextInputBuilder()
                .setCustomId('kayityas')
                .setLabel('Yaş')
                .setStyle(TextInputStyle.Short)
                .setMinLength(1)
                .setPlaceholder('Yaşınız Kaçtır?')
                .setRequired(true);

            const kayitisimrow = new ActionRowBuilder().addComponents(isim);
            const kayityasrow = new ActionRowBuilder().addComponents(yas);
            kayitmodel.addComponents(kayitisimrow, kayityasrow);

            await interaction.showModal(kayitmodel);
        }
    } else if (interaction.isModalSubmit()) {
        const kayitsistemi = db.fetch(`kayıtsistemi_${interaction.guild.id}`);
        if (!kayitsistemi) return;

        if (interaction.customId === 'kizkayitform' || interaction.customId === 'erkekkayitform') {
            const kayitisims = interaction.fields.getTextInputValue("kayitisim");
            const kayityass = interaction.fields.getTextInputValue('kayityas');

            const hedefUye = interaction.message.mentions.members.first(); 

            if (!hedefUye) {
                return interaction.reply({ content: "Kayıt yapılacak üye bulunamadı.", ephemeral: true });
            }

            hedefUye.setNickname(`${kayitisims} | ${kayityass}`).catch(() => {});

            interaction.reply({ content: `${hedefUye} adlı kullanıcı başarılı bir şekilde kayıt oldu!`, ephemeral: true });

            const rol = interaction.customId === 'kizkayitform' ? kayitsistemi.kızrol : kayitsistemi.erkekrol;
            const kayıtsız = kayitsistemi.kayıtsızrol;

            hedefUye.roles.remove(kayıtsız).catch(() => {});
            hedefUye.roles.add(rol).catch(() => {});
            db.set(`uye_${hedefUye.id}`, { isim: kayitisims, yas: kayityass });
        }
    }
  }
};
