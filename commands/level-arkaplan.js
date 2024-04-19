const { PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "level-arka-plan",
  description: " Levelinizin arka planını ayarlayın!",
  type: 1,
  options: [
    {
      type: 3,
      name: "link",
      description: "Link yaz!",
      required: true
    }
  ],

  
  run: async(client, interaction, db, Rank, AddRank, RemoveRank) => {
    
    const { user, guild, options } = interaction;
    
    const link = options.getString("link")
   
    if(!interaction.member.permissions.has(PermissionsBitField.ManageMessages)) {
      return interaction.followUp({ content: "❌ | Mesajları Yönet Yetkin Yok!" })
    }

    db.set(`arkaplan_${interaction.guild.id}`, link)

    interaction.reply("✅ | Başarılı bir şekilde arka plan ayarlandı!")
    
  }
};
