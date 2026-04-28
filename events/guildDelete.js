const Discord = require("discord.js");
const { EmbedBuilder } = require("discord.js")
const config = require("../config.json");

module.exports = {
    name: Discord.Events.GuildDelete,

    run: async (client, guild) => {
        const kanal = config["log"];

        let owner = { tag: "Bilinmiyor", id: "Bilinmiyor" };
        if (guild.ownerId) {
            try {
                owner = await client.users.fetch(guild.ownerId);
            } catch (e) {
                console.error("Kurucu bilgisi alınamadı", e);
            }
        }
        
        const embed = new EmbedBuilder() 
            .setDescription(`Bir Sunucudan Atıldım!
    Sunucu İsmi: ${guild.name}
    Sunucu Kimliği: ${guild.id} 
    Kurucu: ${owner.tag}
    Kurucu Kimliği: ${owner.id}
    Üye Sayısı: ${guild.memberCount}
    Sunucu Sayısı: ${client.guilds.cache.size}`);

        const channel = client.channels.cache.get(kanal);
        if (channel) { 
            channel.send({ embeds: [embed] })
                .catch(error => console.error("Mesaj gönderirken bir hata oluştu:", error));
        } else {
            console.error(`Belirtilen kanal bulunamadı: ${kanal}`);
        }
    }
}
