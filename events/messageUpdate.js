const db = require("croxydb");
const { EmbedBuilder, Events } = require("discord.js");

module.exports = {
  name: Events.MessageUpdate,

  run: async (client, oldMsg, newMsg) => {
    // Sunucunun mod log kanalının ayarlı olup olmadığını kontrol et
    const kanalId = db.fetch(`modlogK_${oldMsg.guild.id}`);
    if (!kanalId) {
      console.log("Modlog kanalı ayarlı değil.");
      return;
    }

    const kanal = client.channels.cache.get(kanalId);
    if (!kanal) {
      console.log("Modlog kanalı bulunamadı.");
      return;
    }

    if (!oldMsg.content || !newMsg.content) return;

    if (!oldMsg.author || !oldMsg.author.tag) return;

    if (newMsg.author && newMsg.author.bot) return;

    if (oldMsg.content === newMsg.content) return;

    if (oldMsg.embeds.length > 0 || newMsg.embeds.length > 0) return;

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setDescription(`Bir mesaj düzenlendi!`)
      .addFields(
        { name: "**Kullanıcı Tag**", value: oldMsg.author.tag, inline: false },
        { name: "**ID**", value: oldMsg.author.id, inline: false },
        { name: "**Eski Mesaj**", value: "```" + oldMsg.content + "```", inline: false },
        { name: "**Yeni Mesaj**", value: "```" + newMsg.content + "```", inline: false },
        { name: "**Düzenleme Zamanı**", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
      );

    kanal.send({ embeds: [embed] });
  }
};