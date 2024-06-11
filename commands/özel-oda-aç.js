const { PermissionsBitField, ChannelType } = require("discord.js");
const Discord = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: "özel-oda-aç",
  description: "Özel oda sistemini ayarlarsın!",
  type: 1,
  options: [
    {
      type: 3,
      name: "isim",
      description: "Oluşturulacak ses kanalının adını yaz!",
      required: true,
    },
  ],
  run: async (client, interaction) => {
    const { user, guild, options } = interaction;
    const odasi = db.fetch(`oda_${interaction.user.id}`);
    if (odasi)
      return interaction.reply({
        content: "❌ | Zaten bir özel odanız bulunmaktadır!",
        ephemeral: true,
      });

    const isim = options.getString("isim");
    const category = await guild.channels.create({
      name: "ÖZEL ODA",
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel], 
        },
      ],
    });

    db.set(`ozelOdaSystemCategory_${interaction.guild.id}`, { category: category.id });
    const ozelOdaCategory = db.fetch(`ozelOdaSystemCategory_${interaction.guild.id}`);
    const channel = await guild.channels.create({
      name: `${isim}`,
      type: ChannelType.GuildVoice,
      parent: ozelOdaCategory.category,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.Connect], 
        },
        {
          id: user.id,
          allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.ViewChannel], 
        },
      ],
    });

    db.set(`ozelodasistemi_${interaction.guild.id}`, isim);
    db.set(`ozelOdaSystemDate_${interaction.guild.id}`, { date: Date.now() });
    db.set(`oda_${interaction.user.id}`, channel.id);

    setTimeout(async () => {
      try {
        const channelCheck = await guild.channels.fetch(channel.id);
        if (channelCheck.members.size === 0) {
          await channelCheck.delete();
          const categoryCheck = await guild.channels.fetch(ozelOdaCategory.category);
          await categoryCheck.delete();
          db.delete(`oda_${interaction.user.id}`);
          const embed = new Discord.EmbedBuilder()
            .setColor("Random")
            .setDescription(`❌ | Sesli kanal boş olduğu için silindi.`);
          interaction.followUp({ embeds: [embed] });
        }
      } catch (error) {
        console.error("Özel oda bulunamadı.");
        const embed = new Discord.EmbedBuilder()
          .setColor("Random")
          .setDescription(`❌ | Özel oda **zaten** silinmiş!`);
        interaction.followUp({ embeds: [embed] });
      }
    }, 20000);

    const embed = new Discord.EmbedBuilder()
      .setColor("Random")
      .setTitle("✅ | Başarılı")
      .setDescription(
        `> Sesli Kanal Başarıyla Oluşturuldu. \n > Ses kanalına girmek için 20 saniyen var yoksa kanal otomatik olarak silinecektir.`
      );
    interaction.reply({ embeds: [embed] });
  },
};
