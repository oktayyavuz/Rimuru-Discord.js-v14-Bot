const { Client, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder } = require("discord.js");

module.exports = {
    name: "sunucubanner",
    description: 'Sunucunun bannerına bakarsın!',
    type: 1,
    options: [],
      
    run: async(client, interaction) => {
        const bannerUrl = interaction.guild.bannerURL({ dynamic: true, size: 512 });

        if (!bannerUrl) {
            return interaction.reply({
                content: "Bu sunucunun bir bannerı yok!",
                ephemeral: true
            });
        }

        interaction.reply({
            embeds: [
                {
                    title: `${interaction.guild.name} adlı sunucunun bannerı:`,
                    description: `[Link](${bannerUrl})`,
                    image: { url: bannerUrl }
                }
            ]
        });
    }
};
