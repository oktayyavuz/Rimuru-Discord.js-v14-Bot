const { Client, EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb")
module.exports = {
  name: "sa-as",
  description: " Selam Sistemini Açıp Kapatırsın!",
  type: 1,
  options: [
    {
      type: 3,
      name: "seçenek",
      description: "Sistemi kapatacak mısın yoksa açacak mısın?",
      required: true,
      choices: [
        {
          name: "Aç",
          value: "ac"
        },
        {
          name: "Kapat",
          value: "kapat"
        }
      ]
    }
  ],

  run: async(client, interaction) => {
    const { user, guild, options } = interaction;
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return interaction.reply({content: "❌ | Rolleri Yönet Yetkin Yok!", ephemeral: true})
    const saasSystemTrue = options.getString("seçenek");
    const saasSystem = db.fetch(`saas_${interaction.guild.id}`)
 
    switch(saasSystemTrue) {
      case "ac": {
        if(saasSystem) return interaction.reply({ content: "❌ | Bu sistem zaten açık!" });
  
        db.set(`saas_${interaction.guild.id}`, true)
        return interaction.reply({ content: "✅ | Başarılı bir şekilde sistem açıldı!" });
      }
  
      case "kapat": {
        if(!saasSystem) return interaction.reply({ content: "❌ | Bu sistem zaten kapalı?" });
  
        db.delete(`saas_${interaction.guild.id}`)
        return interaction.reply({ content: "✅ | Başarılı bir şekilde sistem kapatıldı!" });
      }
    }

  }

};
