const db = require("croxydb");
const { PermissionFlagsBits, EmbedBuilder, Events, PermissionsBitField  } = require("discord.js");
const Discord = require("discord.js")

module.exports = {
    name: "messageCreate",
    once: false,
    run: async (client, message) => {
        try {
            if (message.author.bot) return;
            if (!message.guild) return;

            const xp = db.fetch(`xpPos_${message.author.id}${message.guild.id}`);
            const levellog = db.fetch(`level_log_${message.guild.id}`);
            const level = db.fetch(`levelPos_${message.author.id}${message.guild.id}`);

            const acikmi = db.fetch(`acikmiLevel_${message.guild.id}`) ? true : false;
            if (acikmi) {
				if (xp >= 99) {
                    db.subtract(`xpPos_${message.author.id}${message.guild.id}`, xp);
                    db.add(`levelPos_${message.author.id}${message.guild.id}`, 1);

                    client.channels.cache.get(levellog).send(`${message.author} GG!, artık yeni seviyene ulaştın, tebrikler! Yeni seviyen: **${level + 1}**`);
                } else {
                    db.add(`xpPos_${message.author.id}${message.guild.id}`, 1);
                }
            }

            if (await db.get(`afk_${message.author.id}`)) {
                const afkDate = db.fetch(`afkDate_${message.author.id}`);
                const sebep = db.fetch(`afk_${message.author.id}`);

                if (afkDate && sebep) {
                    const date = `${message.author} Hoş geldin! **${sebep}** sebebiyle <t:${parseInt(afkDate.date / 1000)}:R> afk'ydın`;
                    db.delete(`afk_${message.author.id}`);
                    db.delete(`afkDate_${message.author.id}`);

                    message.reply(date);
                }
            }

            const kullanıcı = message.mentions.users.first();
            if (kullanıcı) {
                const afkDate = db.fetch(`afkDate_${kullanıcı.id}`);
                const sebep = await db.get(`afk_${kullanıcı.id}`);

                if (sebep) {
                    const sebeps = `❔ | Etiketlediğin kullanıcı **${sebep}** sebebiyle afk modunda!`;
                    message.reply(sebeps);
                }
            }

            const kufur = db.fetch(`kufurengel_${message.guild.id}`);

            if (kufur) {
                const kufurler = ["sikik","sike","sikey","sikeyi","amk", "piç", "yarrak", "oç", "göt", "amq", "yavşak", "amcık", "amcı", "orospu", "sikim", "sikeyim", "aq", "mk", "oruspu çocugu", "ananı", "sıkım", "amcık",  "oruspu"," baban jigolo", "aile boyu orospunuz", "ailen fahişlere klubü", "ailen oç", "ailen oropular konseyi", "ailen yarrağıma bağımlı", "ailen yavşak mı", "ailene boydan gireyim", "ailene gibtir git", "ailene götten gireyim", "ailene matkapla gireyim", "ailene tornavida ile gireyim", "aileni götten sikerim", "aileni ıslak sopayla sikeyim", "aileni kökten sikerim", "aileni kucakta aneni yatakta", "aileni sikeyim", "aileni siktim öldü", "aileni siqem", "aileni toplu sikeirm", "aileni yarrakla sikerim", "ailenin ağızına sıçayım", "ailenin amına koyayım", "ailenin amk", "ailenle toplu seks edem", "Allah oç", "Allah orospu", "Allah yavşak", "Allah yedim öldü", "Allahı sikeyim", "Allahı siktim öldü", "Allahın amk", "Allahını sikerim", "Allahını sikeyim", "Allah'ını sikeyim", "Allahini sikeyim", "Allah'ini sikeyim", "amınakoduğum ailesizi", "amk veledi ailene git", "anan aramış sikilmesi gerek", "anan bağımlım ama yarak", "anan bar fahişesi", "anan benim zuckeri istiyor", "anan bilir", "anan eskort", "anan esxort", "anan fahişe", "anan fuck", "anan fuck it", "anan fuck itlerim"];
                if (kufurler.some((word) => message.content.toLowerCase().includes(word))) {
                  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    message.delete();
                    const embed = new EmbedBuilder()
                      .setTitle(`❗ **UYARI!**`)
                      .setDescription(`✋ | ${message.author}, Küfür etme güzel kardeşim diline biber mi süreyim yani!`);
                    const msg = await message.channel.send({ embeds: [embed] });
                    if (msg) setTimeout(() => msg.delete(), 5000);
                  }
                }
              }

            const reklamlar = db.fetch(`reklamengel_${message.guild.id}`);

            if (reklamlar) {
                const linkler = [".com.tr", ".net", ".org", ".tk", ".cf", ".gf", "https://", ".gq", "http://", ".com", ".gg", ".porn", ".edu"];

                if (linkler.some(alo => message.content.toLowerCase().includes(alo))) {
                    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
                    if (message.author.bot) return;

                    message.delete();
                    const embed = new EmbedBuilder()
                    .setTitle(`❗ **UYARI!**`)
                    .setDescription(`✋ | ${message.author}, Reklam atmaya devam edersen banlanacaksın!`);
                const msg = await message.channel.send({ embeds: [embed] });
                if (msg) setTimeout(() => msg.delete(), 5000);
                }
            }

            const kanal = db.get(`görselengel.${message.guild.id}`);
            if (message.channel.id == kanal) {
                if (!message.attachments.first()) {
                    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
                    if (message.author.bot) return;

                    message.delete();
                    const msg = await message.channel.send(`${message.author}, Bu Kanalda Sadece GIF & Resim Atabilirsiniz.`);
                    if (msg) setTimeout(() => msg.delete(), 5000);
                }
            }

            const data = db.fetch(`yasaklı_kelime_${message.guild.id}`);
            if (data) {
                if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
                if (message.author.bot) return;
                if (data.includes(message.content)) {
                    message.delete();
                    const embed = new EmbedBuilder()
                    .setTitle(`❗ **UYARI!**`)
                    .setDescription(`✋ | ${message.author}, Yasaklı Kelime Kulanmayınız!`);
                const msg = await message.channel.send({ embeds: [embed] });
                if (msg) setTimeout(() => msg.delete(), 5000);
                }
            }

            const saas = db.fetch(`saas_${message.guild.id}`);

            if (message.content.length > 4) {
                if (db.fetch(`capslockengel_${message.guild.id}`)) {
                    const caps = message.content.toUpperCase();
                    if (message.content === caps) {
                        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                            if (!message.mentions.users.first()) {
                                message.delete();
                                const embed = new EmbedBuilder()
                                    .setTitle(`❗ **UYARI!**`)
                                    .setDescription(`✋ | ${message.author}, Bu sunucuda büyük harf kullanımı engelleniyor!`);
                                const msg = await message.channel.send({ embeds: [embed] });
                                if (msg) setTimeout(() => msg.delete(), 5000);
                            }
                        }
                    }
                }
            }
        } catch (err) {
            console.error('An error occurred:', err);
        }
    }
};
