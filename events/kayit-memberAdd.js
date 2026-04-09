const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const db = require("croxydb");
const config = require("../config.json");

module.exports = {
  name: "guildMemberAdd",
  run: async (client, member) => {
    const kayitSistemi = db.fetch(`kayıtsistemi_${member.guild.id}`);
    if (!kayitSistemi) return;

    const kayıtsız = member.guild.roles.cache.get(kayitSistemi.kayıtsızrol);
    if (!kayıtsız) return;

    member.setNickname("İsim | Yaş").catch(() => {});
    member.roles.add(kayıtsız).catch(() => {});
    
    const kayıtKanalı = member.guild.channels.cache.get(kayitSistemi.kayıtkanal);
    if (!kayıtKanalı) return;

    const botsahip = `<@${config["sahip"]}>`;
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
    }).catch(() => {});
  }
};
