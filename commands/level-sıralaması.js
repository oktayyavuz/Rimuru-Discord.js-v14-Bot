const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, Client, CommandInteraction, ComponentType } = require("discord.js");
const db = require('croxydb');
module.exports = {
  name: "level-sıralaması",
  description: "Sunucunun level sıralamasını görüntüleyin.",
  type: 1,
  options: [],

  /**
   * 
   * @param {Client} client 
   * @param {CommandInteraction} interaction
   */

  run: async (client, interaction) => {
    try {
      const { user, guild, options } = interaction;

      let page = 0;
      const pageSize = 10;

      const usersWithRank = client.users.cache
      .filter(user => {
        const xpPos = db.fetch(`xpPos_${user.id}${guild.id}`) || 0;
        const levelPos = db.fetch(`levelPos_${user.id}${guild.id}`) || 0;
  
        return !user.bot && (xpPos !== 0 || levelPos !== 0);
      })
        .map((user) => ({
          user,
          levelPos: db.fetch(`levelPos_${user.id}${guild.id}`) || 0,
          xpPos: db.fetch(`xpPos_${user.id}${guild.id}`) || 0
        }))
        .sort((a, b) => b.levelPos - a.levelPos || b.xpPos - a.xpPos);

      const content = usersWithRank
        .map(({ user, levelPos, xpPos }, index) => {
          return `${index + 1}. <@${user.id}> **|** ${levelPos} Seviye, ${xpPos} Xp`;
        });

      const totalPages = Math.ceil(content.length / pageSize);

      const embed = new EmbedBuilder()
        .setColor("Random")
        .setTitle(`${guild.name} Sunucusunun Level Sıralaması`);

      if (content.length > 0) {
        embed.setDescription(`${content.slice(page * pageSize, (page + 1) * pageSize).join("\n")}`);
      } else {
        embed.setDescription("Level sıralaması bulunamadı.");
      }

      const backButton = new ButtonBuilder()
        .setLabel("Geri")
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("back");

      const disabledButton = new ButtonBuilder()
        .setEmoji("⏰")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true)
        .setCustomId("qewqwewq");

      const nextButton = new ButtonBuilder()
        .setLabel("İleri")
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("next");

      let int = interaction.reply({ embeds: [embed], components: [
        new ActionRowBuilder().addComponents(backButton, disabledButton, nextButton)
      ] });
      const filtre = (i) => i.user.id === interaction.user.id;
      const xxx = (await int).createMessageComponentCollector({
        filter: filtre, 
        componentType: ComponentType.Button
      });

      xxx.on('collect', async (i) => {
      
        if (!i.isButton()) return;
      
        if (i.customId === "back") {
          if (page > 0) {
            page--;
          }
        } else if (i.customId === "next") {
          if (page < totalPages - 1) {
            page++;
          }
        }
      
        const embed = new EmbedBuilder()
          .setColor("Random")
          .setTitle(`${guild.name} Sunucusunun Level Sıralaması`);
      
        if (content.length > 0) {
          embed.setDescription(`${content.slice(page * pageSize, (page + 1) * pageSize).join("\n")}`);
        } else {
          embed.setDescription("Level sıralaması bulunamadı.");
        }
      
        embed.setFooter({
          text: `Sayfa ${page + 1}/${totalPages}`,
          iconURL: interaction.guild.iconURL({ dynamic: true })
        });
      
        await i.update({ embeds: [embed] });
      
      })
      

    } catch (error) {
      console.error(error);
    }
  },
};
