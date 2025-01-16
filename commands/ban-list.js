const { Client, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require("discord.js");
const config = require("../config.json");

module.exports = {
  name: "ban-list",
  description: "Banlı Olan Kullanıcıları Görürsün!",
  type: 1,
  options: [],

  run: async (client, interaction) => {
    try {
      let page = 0;
      const pageSize = 10;

      const bannedUsers = await interaction.guild.bans.fetch();
      if (bannedUsers.size === 0) {
        const embed = new EmbedBuilder()
          .setDescription("Sunucunuzda Banlanan Kimse Yok!")
          .setColor("Red")
          .setTitle("❌ | Hata!");
        return interaction.reply({ embeds: [embed] });
      }

      const content = bannedUsers.map((ban) => `\`${ban.user.username}\``);
      const totalPages = Math.ceil(content.length / pageSize);

      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle(`${config["bot-adi"]} - Ban List`)
        .setImage("https://i.hizliresim.com/5a4q2rc.gif");

      if (content.length > 0) {
        embed.setDescription(`${content.slice(page * pageSize, (page + 1) * pageSize).join(", ")}`);
      } else {
        embed.setDescription("Banlı kullanıcı bulunamadı.");
      }

      const backButton = new ButtonBuilder()
        .setLabel("Geri")
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("back")
        .setDisabled(page === 0);

      const nextButton = new ButtonBuilder()
        .setLabel("İleri")
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("next")
        .setDisabled(page >= totalPages - 1);

      const message = await interaction.reply({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(backButton, nextButton)],
        fetchReply: true
      });

      const filter = (i) => i.user.id === interaction.user.id;
      const collector = message.createMessageComponentCollector({
        filter,
        componentType: ComponentType.Button,
        time: 60000 // 1 dakika
      });

      collector.on('collect', async (i) => {
        if (!i.isButton()) return;

        if (i.customId === "back" && page > 0) {
          page--;
        } else if (i.customId === "next" && page < totalPages - 1) {
          page++;
        }

        const newEmbed = new EmbedBuilder()
          .setColor("#ff0000")
          .setTitle(`${config["bot-adi"]} - Ban List`)
          .setImage("https://i.hizliresim.com/5a4q2rc.gif");

        if (content.length > 0) {
          newEmbed.setDescription(`${content.slice(page * pageSize, (page + 1) * pageSize).join(", ")}`);
        } else {
          newEmbed.setDescription("Banlı kullanıcı bulunamadı.");
        }

        newEmbed.setFooter({
          text: `Sayfa ${page + 1}/${totalPages}`,
          iconURL: interaction.guild.iconURL({ dynamic: true }),
        });

        const updatedBackButton = new ButtonBuilder()
          .setLabel("Geri")
          .setStyle(ButtonStyle.Secondary)
          .setCustomId("back")
          .setDisabled(page === 0);

        const updatedNextButton = new ButtonBuilder()
          .setLabel("İleri")
          .setStyle(ButtonStyle.Secondary)
          .setCustomId("next")
          .setDisabled(page >= totalPages - 1);

        await i.update({
          embeds: [newEmbed],
          components: [new ActionRowBuilder().addComponents(updatedBackButton, updatedNextButton)]
        });
      });

      collector.on('end', async () => {
        const disabledBackButton = new ButtonBuilder()
          .setLabel("Geri")
          .setStyle(ButtonStyle.Secondary)
          .setCustomId("back")
          .setDisabled(true);

        const disabledNextButton = new ButtonBuilder()
          .setLabel("İleri")
          .setStyle(ButtonStyle.Secondary)
          .setCustomId("next")
          .setDisabled(true);

        await message.edit({
          components: [new ActionRowBuilder().addComponents(disabledBackButton, disabledNextButton)]
        });
      });

    } catch (error) {
      console.error(error);
    }
  },
};
