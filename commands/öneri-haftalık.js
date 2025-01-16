const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: "haftalık-öneri",
  description: "Haftalık en iyi öneriyi belirleyin.",
  type: 1,

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: "❌ | Yalnızca yöneticiler bu komutu kullanabilir!", ephemeral: true });
    }

    const öneriKanalId = db.get(`önerikanal_${interaction.guild.id}`);
    if (!öneriKanalId) {
      return interaction.reply({ content: "❌ | Öneri kanalı ayarlanmadı!", ephemeral: true });
    }

    const öneriKanal = interaction.guild.channels.cache.get(öneriKanalId);
    if (!öneriKanal) {
      return interaction.reply({ content: "❌ | Öneri kanalı bulunamadı!", ephemeral: true });
    }

    const fetchedMessages = await öneriKanal.messages.fetch({ limit: 100 });
    const öneriler = fetchedMessages.filter(msg => msg.author.bot && msg.embeds.length > 0);

    let enİyiÖneri = null;
    let enİyiPuan = -1;

    for (const öneri of öneriler.values()) {
      const upVotes = öneri.reactions.cache.get("🔼")?.count || 0;
      const downVotes = öneri.reactions.cache.get("🔽")?.count || 0;
      const totalVotes = upVotes + downVotes;

      if (totalVotes === 0) continue;

      const ortalamaPuan = (upVotes / totalVotes) * 100;
      if (ortalamaPuan > enİyiPuan) {
        enİyiPuan = ortalamaPuan;
        enİyiÖneri = öneri;
      }
    }

    if (!enİyiÖneri) {
      return interaction.reply({ content: "❌ | Bu hafta için yeterli oy verilmiş öneri bulunamadı!", ephemeral: true });
    }

    const öneriEmbed = enİyiÖneri.embeds[0];
    const öneriYapan = öneriEmbed.footer.text.split(": ")[1];
    const öneriMetni = öneriEmbed.description.split("\n\n")[1];

    const embed = new EmbedBuilder()
      .setColor("Gold")
      .setTitle("Haftanın En İyi Önerisi")
      .setDescription(`**${interaction.guild.members.cache.get(öneriYapan).user.tag}** tarafından yapılan öneri:\n\n${öneriMetni}`)
      .addFields({ name: "Ortalama Puan", value: `${enİyiPuan.toFixed(2)} / 100` });

    return interaction.reply({ embeds: [embed] });
  }
};
