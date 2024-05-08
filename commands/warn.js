const { EmbedBuilder } = require("discord.js");
const db = require("croxydb");
const ms = require("ms");

module.exports = {
  name: "Uyarı",
  description: "Uyarı sistemi",
  type: 1,
  options: [
    {
      name: "kullanıcı",
      description: "Uyarı verilecek kullanıcıyı seçin",
      type: 6,
      required: true
    },
    {
      name: "sebep",
      description: "Uyarı sebebini belirtin",
      type: 3,
      required: true
    }
  ],

  run: async (client, interaction) => {
 const mod = db.get(`Mod_${interaction.guild.id}`);

if (!interaction.member.roles.cache.has(mod.id)) {
  return interaction.reply({ content: "Bu komutu kullanmak için yetkiniz yok.", ephemeral: false });
}

    const user = interaction.options.getMember("kullanıcı");
    const reason = interaction.options.getString("sebep");

    if (!user || !reason) {
      return interaction.reply({ content: "Lütfen bir kullanıcı seçin ve uyarı sebebini belirtin.", ephemeral: true });
    }

    const guildKey = `${interaction.guild.id}.${user.id}`;
    const warningCount = db.get(guildKey) || 1;

    db.add(guildKey, 1);

    const embed = new EmbedBuilder()
      .setColor("Aqua")
      .setTitle("Uyarı Bilgisi")
      .setDescription(`${user} üyesinin uyarı sayısı: ${warningCount}`)
      .addFields({ name: "Uyarı Sebebi", value: reason })
      .setTimestamp()
      .setFooter({ text: "Rimuru", iconURL: interaction.guild.iconURL({ format: "png", dynamic: true, size: 2048 }) });

    const logChannelID = db.get(`logChannel_${interaction.guild.id}`);
    const logChannel = interaction.guild.channels.cache.get(logChannelID);

    if (logChannel) {
      logChannel.send({ embeds: [embed] });
    } else {
      console.error("Log kanalı bulunamadı.");
    }

    const muteRoleID = db.get(`Mute_${interaction.guild.id}`);
    const jailRoleID = db.get(`Jail_${interaction.guild.id}`);

    if (warningCount === 3 && muteRoleID) {
      user.roles.add(muteRoleID);
      setTimeout(() => user.roles.remove(muteRoleID), ms('2h'));
      interaction.reply({ embeds: [embed.setDescription(`${user} üyesi \`3\` uyarı sayısına ulaştığı için <@&${muteRoleID}> rolü verildi. 2 saat sonra kaldırılacak.`)] }).then((e) => setTimeout(() => { e.delete(); }, 12000));
    } else if (warningCount === 5 && muteRoleID) {
      user.roles.add(muteRoleID);
      setTimeout(() => user.roles.remove(muteRoleID), ms('1d'));
      interaction.reply({ embeds: [embed.setDescription(`${user} üyesi \`5\` uyarı sayısına ulaştığı için <@&${muteRoleID}> rolü verildi. 1 gün sonra kaldırılacak.`)] }).then((e) => setTimeout(() => { e.delete(); }, 12000));
    } else if (warningCount === 7 && jailRoleID) {
      user.roles.add(jailRoleID);
      setTimeout(() => user.roles.remove(jailRoleID), ms('4d'));
      interaction.reply({ embeds: [embed.setDescription(`${user} üyesi \`7\` uyarı sayısına ulaştığı için <@&${jailRoleID}> rolü verildi. 4 gün sonra kaldırılacak.`)] }).then((e) => setTimeout(() => { e.delete(); }, 12000));
    } else if (warningCount === 9) {
      interaction.guild.members.ban(user.id, { reason: `Otomatik ceza sistemi` });
      interaction.reply({ embeds: [embed.setDescription(`${user} üyesi \`9\` uyarı sayısına ulaştığı için banlandı.`)] }).then((e) => setTimeout(() => { e.delete(); }, 12000));
    } else {
      interaction.reply({ embeds: [embed.setDescription(`${user} üyesine uyarı verildi. Uyarı Sayısı: ${warningCount}`)] }).then((e) => setTimeout(() => { e.delete(); }, 12000));
    }
  }
};