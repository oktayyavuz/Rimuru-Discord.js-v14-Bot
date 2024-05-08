const { Client, EmbedBuilder } = require("discord.js");
const Discord = require('discord.js')
const moment = require("moment");
const db = require("croxydb")
  require("moment-duration-format");
  const os = require("os");
module.exports = {
  name: "istatistik",
  description: " Botun istatistiğini görürsün!",
  type: 1,
  options: [],

  run: async(client, interaction) => {
    const Uptime = moment
    .duration(client.uptime)
    .format(" D [gün], H [saat], m [dakika], s [saniye]");
	    const row = new Discord.ActionRowBuilder()
    .addComponents(
new Discord.ButtonBuilder()
.setLabel("Yenile")
.setStyle(Discord.ButtonStyle.Secondary)
.setEmoji('1039607071093567658')
.setCustomId("yenile_"+interaction.user.id))
.addComponents(
  new Discord.ButtonBuilder()
      .setEmoji("1039607063443161158")
      .setLabel(" ")
      .setStyle(Discord.ButtonStyle.Secondary)
      .setCustomId(".clearMessageButton_"+interaction.user.id)
)
let zaman = db.get(`botAcilis_`)
let date = `<t:${Math.floor(zaman / 1000)}:R>`

let servers = client.guilds.cache.size
var yes1 = servers > 100
var yes15 = servers > 150
var yes2 = servers > 200
var yes25 = servers > 250
var yes3 = servers > 300
var yes35 = servers > 350
var yes4 = servers > 400
var yes45 = servers > 450
var yes5 = servers > 500

var basDolu = "🟥🟧"
var basBos = "🟥🟧"
var ortaDolu = "🟥🟧"
var ortaBos = "🟥🟧"
var sonDolu = "🟥🟧"
var sonBos = "🟥🟧"

	let members = client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString()
    const embed = new EmbedBuilder()
    .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
    .addFields(
      { name: '</> Bot Sahibi', value: `**oktayyavuzjp**`, inline: true },
      { name: "👥 Kullanıcılar", value: `${members}`, inline: true },
      { name: "🧩 Sunucular", value: `${servers}`, inline: true },
      { name: "📼 Bellek Kullanımı", value: `${(process.memoryUsage().heapUsed / 1024 / 512).toFixed(2)}MB`, inline: true },
      { name: "⏳ Açılma Süresi", value: `${date}`, inline: true },
      { name: "⏺️ Ping", value: `${client.ws.ping}`, inline: true },
      { name: `📋 Sunucu Hedef Barı [${servers}/500]`, value: `${yes1 ? `${basDolu}` : `${basBos}`}${yes15 ? `${ortaDolu}` : `${ortaBos}`}${yes2 ? `${ortaDolu}` : `${ortaBos}`}${yes25 ? `${ortaDolu}` : `${ortaBos}`}${yes3 ? `${ortaDolu}` : `${ortaBos}`}${yes35 ? `${ortaDolu}` : `${ortaBos}`}${yes4 ? `${ortaDolu}` : `${ortaBos}`}${yes45 ? `${ortaDolu}` : `${ortaBos}`}${yes5 ? `${sonDolu}` : `${sonBos}`}`, inline: true },
    )
    interaction.reply({embeds: [embed], components: [row]})

  }

};
