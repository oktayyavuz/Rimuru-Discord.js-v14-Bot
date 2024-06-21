const db = require("croxydb");
const { EmbedBuilder, Events } = require("discord.js");

module.exports = {
  name: Events.MessageUpdate,

  run: async (client, oldMsg, newMsg) => {

    if (!db.has(`modlogK_${oldMsg.guild.id}`)) return;

    if (!db.fetch(`modlogK_${oldMsg.guild.id}`)) return;

    const kanal = db.fetch(`modlogK_${oldMsg.guild.id}`);

    if (!oldMsg.author || !oldMsg.author.tag) return;

    if (newMsg.author && newMsg.author.bot) return;

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

    client.channels.cache.get(kanal).send({ embeds: [embed] });
  }
};
