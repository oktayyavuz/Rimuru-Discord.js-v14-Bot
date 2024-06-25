const { Client, EmbedBuilder } = require("discord.js");
const config = require("../config.json"); 
module.exports = {
  name: "ban-list",
  description: " Banlı Olan Kullanıcıları Görürsün!",
  type: 1,
  options: [],

  run: async(client, interaction) => {

    var userlist = interaction.guild.bans.fetch()
    userlist.then(collection => {
    if(collection.first() == null){
      
    const embed = new EmbedBuilder()
    .setDescription("Sunucunuzda Banlanan Kimse Yok!")      
    .setColor("Red")
    .setTitle("❌ | Hata!")
    interaction.reply({embeds: [embed]})
      
    } else {
    const data = collection.map(mr => "`"+mr.user.username+"`").slice(0, 60).join(", ")
    const embed2 = new EmbedBuilder()
    .setTitle(`${config["bot-adi"]} - Ban List`)
    .setColor("#ff0000")
    .setImage("https://i.hizliresim.com/5a4q2rc.gif")
    .setDescription(data)
    interaction.reply({embeds: [embed2]})
}

  })
}

};
