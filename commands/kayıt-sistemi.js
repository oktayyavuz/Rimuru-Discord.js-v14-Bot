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
            name: "kayıtlı-rol",
            description: "Kayıtlı rolünü ayarlarsın!",
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
        const kayıtlırol = interaction.options.getRole('kayıtlı-rol');
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
            .setDescription(`✅ | __**Kayıt Sistemi**__ başarıyla ayarlandı!\n\n ***#*** |  Kayıt Kanalı: ${kayıtkanal}\n🤖 Kayıtlı Rolü: ${kayıtlırol}\n🤖 Kayıtsız Rolü: ${kayıtsızrol}`);
        
        db.set(`kayıtsistemi_${interaction.guild.id}`, { kayıtkanal: kayıtkanal.id, kayıtlırol: kayıtlırol.id, kayıtsızrol: kayıtsızrol.id });
        db.set(`kayıtsistemiDate_${interaction.guild.id}`, { date: Date.now() });

        return interaction.reply({ embeds: [basarili], ephemeral: false }).catch((e) => { });
    }
};

client.on("guildMemberAdd", async (member) => {
    const kayitSistemi = db.fetch(`kayıtsistemi_${member.guild.id}`);
    if (!kayitSistemi) return;

    const kayıtsız = member.guild.roles.cache.get(kayitSistemi.kayıtsızrol);
    if (!kayıtsız) return;

    member.setNickname("İsim | Yaş").catch(console.error);
    member.roles.add(kayıtsız).catch(console.error); // Add the kayıtsız role to the member
    const kayıtKanalı = member.guild.channels.cache.get(kayitSistemi.kayıtkanal);
    if (!kayıtKanalı) return;

    const kayıtMesajı = new EmbedBuilder()
        .setColor("Blue")
        .setTitle(`${member.guild.name} Sunucusuna Hoşgeldin`)
        .setDescription(`Kayıt olmak için ✅ Kayıt Ol butonuna basabilirsiniz.\n\nCreate By ${botsahip} 💖`);

    const kayıtButonu = new ButtonBuilder()
        .setCustomId("kayitol")
        .setLabel("✅ Kayıt Ol")
        .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(kayıtButonu);

    kayıtKanalı.send({
        content: `Hoş geldin, ${member}!`,
        embeds: [kayıtMesajı],
        components: [row]
    });
});

client.on("guildMemberRemove", async (member) => {
    db.delete(`kayıtlıuye_${member.id}`);
    console.error('Üyenin kaydı silinemedi')
});
client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId === "kayitol") {
            const kayitmodel = new ModalBuilder()
                .setCustomId('kayitform')
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
        if (interaction.customId === 'kayitform') {
            const kayitisims = interaction.fields.getTextInputValue("kayitisim");
            const kayityass = interaction.fields.getTextInputValue('kayityas');

            interaction.member.setNickname(`${kayitisims} | ${kayityass}`);
            interaction.reply({ content: `${interaction.user} adlı kullanıcı başarılı bir şekilde kayıt oldu!`, ephemeral: true });

            const kayitsistemi = db.fetch(`kayıtsistemi_${interaction.guild.id}`);
            const kayıtlı = await interaction.guild.roles.cache.find(role => role.id === kayitsistemi.kayıtlırol);
            const kayıtsız = await interaction.guild.roles.cache.find(role => role.id === kayitsistemi.kayıtsızrol);

            interaction.member.roles.remove(kayıtsız.id);
            interaction.member.roles.add(kayıtlı.id);
            db.set(`kayıtlıuye_${interaction.member.id}`, { isim: kayitisims, yas: kayityass });
        }
    }
});
