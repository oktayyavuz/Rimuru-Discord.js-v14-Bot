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

client.on("guildMemberAdd", async (member) => {
    const kayitSistemi = db.fetch(`kayıtsistemi_${member.guild.id}`);
    if (!kayitSistemi) return;

    const kayıtsız = member.guild.roles.cache.get(kayitSistemi.kayıtsızrol);
    if (!kayıtsız) return console.error("Kayıtsız rolü bulunamadı.");

    member.setNickname("İsim | Yaş").catch(console.error);
    member.roles.add(kayıtsız).catch(console.error); 
    const kayıtKanalı = member.guild.channels.cache.get(kayitSistemi.kayıtkanal);
    if (!kayıtKanalı) return console.error("Kayıt kanalı bulunamadı.");

    const kayıtMesajı = new EmbedBuilder()
        .setColor("Blue")
        .setTitle(`${member.guild.name} Sunucusuna Hoşgeldin`)
        .setDescription(`Kayıt olmak için yetkili kişilerden birine ulaşabilirsiniz.\n\nCreate By ${botsahip} 💖`);

    const kızButonu = new ButtonBuilder()
        .setCustomId("kizkayit")
        .setLabel("Kız Kayıt")
        .setStyle(ButtonStyle.Success);

    const erkekButonu = new ButtonBuilder()
        .setCustomId("erkekkayit")
        .setLabel("Erkek Kayıt")
        .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(kızButonu, erkekButonu);

    kayıtKanalı.send({
        content: `Hoş geldin, ${member}!`,
        embeds: [kayıtMesajı],
        components: [row]
    });
});

client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
        const kayitsistemi = db.fetch(`kayıtsistemi_${interaction.guild.id}`);
        if (!kayitsistemi) return;



        const hedefUye = interaction.message.mentions.members.first(); 
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

            hedefUye.setNickname(`${kayitisims} | ${kayityass}`).catch(console.error);

            interaction.reply({ content: `${hedefUye} adlı kullanıcı başarılı bir şekilde kayıt oldu!`, ephemeral: true });

            const rol = interaction.customId === 'kizkayitform' ? kayitsistemi.kızrol : kayitsistemi.erkekrol;
            const kayıtsız = kayitsistemi.kayıtsızrol;

            hedefUye.roles.remove(kayıtsız).catch(console.error);
            hedefUye.roles.add(rol).catch(console.error);
            db.set(`uye_${hedefUye.id}`, { isim: kayitisims, yas: kayityass });
        }
    }
});

client.on("guildMemberRemove", async (member) => {
    db.delete(`uye_${member.id}`);
});
