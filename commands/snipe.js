const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "snipe",
  description: "Son silinen mesajı gösterir.",
  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({ content: "Bu komutu kullanmak için mesajları yönet yetkisine sahip olmalısınız!", ephemeral: true });
    }

    const snipes = client.snipes.get(interaction.channel.id) || [];
    
    const userSnipes = snipes.filter(snipe => !snipe.author.bot);

    if (userSnipes.length === 0) {
      return interaction.reply({ content: "Bu kanalda silinen kullanıcı mesajı bulunamadı!", ephemeral: true });
    }

    const snipe = userSnipes[0];

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setAuthor({ name: snipe.author.tag, iconURL: snipe.author.displayAvatarURL() })
      .setDescription(snipe.content)
      .setTimestamp(snipe.timestamp)
      .setFooter({ text: `ID: ${snipe.author.id}` });

    interaction.reply({ embeds: [embed] });
  },
};

client.snipes = new Map();

client.on("messageDelete", message => {
  if (message.partial) return;
  if (message.author.bot) return; 
  
  const snipes = client.snipes.get(message.channel.id) || [];
  if (snipes.length > 10) snipes.length = 10; 

  snipes.unshift({
    content: message.content,
    author: message.author,
    timestamp: message.createdTimestamp
  });

  client.snipes.set(message.channel.id, snipes);
});
