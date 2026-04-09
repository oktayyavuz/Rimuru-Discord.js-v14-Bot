const db = require("croxydb");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "ready",
  once: true,
  run: async (client) => {
    const allData = db.all();
    
    // croxydb all() formatına göre anahtarları filtreleyelim
    // all() genellikle bir objedir veya entry listesidir
    const keys = Object.keys(allData);
    const oylamaKeys = keys.filter(key => key.startsWith('oylama_'));
    
    oylamaKeys.forEach(key => {
      const msgId = key.split('_')[1];
      checkOylamaSüresi(client, msgId);
    });
    
    console.log(`[+] Oylama sistemi: ${oylamaKeys.length} adet bekleyen oylama kontrol ediliyor.`);
  }
};

function checkOylamaSüresi(client, msgId) {
  const oylamaData = db.get(`oylama_${msgId}`);
  if (!oylamaData) return;

  const kalanSüre = oylamaData.bitis - Date.now();
  if (kalanSüre <= 0) {
    finishOylama(client, msgId);
  } else {
    setTimeout(() => finishOylama(client, msgId), kalanSüre);
  }
}

async function finishOylama(client, msgId) {
  try {
    const oylamaData = db.get(`oylama_${msgId}`);
    if (!oylamaData) return;

    const channel = await client.channels.fetch(oylamaData.kanal).catch(() => null);
    if (!channel) {
        db.delete(`oylama_${msgId}`);
        return;
    }

    const msg = await channel.messages.fetch(oylamaData.mesaj).catch(() => null);
    if (!msg) {
        db.delete(`oylama_${msgId}`);
        return;
    }

    const currentEmbed = msg.embeds[0];
    const resultEmbed = new EmbedBuilder()
      .setTitle("Oylama Sona Erdi!")
      .setDescription(`${currentEmbed?.description || "Başlık bulunamadı"}`)
      .addFields(
        { name: 'Evet Oyları', value: `${oylamaData.evet}`, inline: true },
        { name: 'Hayır Oyları', value: `${oylamaData.hayir}`, inline: true }
      )
      .setColor("Random");

    await msg.edit({ embeds: [resultEmbed], components: [] });
    db.delete(`oylama_${msgId}`);
  } catch (err) {
    console.error("Oylama bitirme hatası:", err);
    db.delete(`oylama_${msgId}`);
  }
}
