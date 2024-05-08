const Discord = require("discord.js");
const db = require("croxydb");

module.exports = {
    name: "guildMemberRemove",
    run: async (client, member) => {
        try {

            
            // Sunucudan ayrılan kullanıcıya özel bir mesaj gönderme veya diğer işlemler
            const giriscikissystem = db.fetch(`canvaskanal_${member.guild.id}`);
            if (giriscikissystem) {
                const giriscikiskanal = member.guild.channels.cache.find(c => c.id === giriscikissystem.channel);
                const Canvas = require("canvas");
                const canvas = Canvas.createCanvas(648, 387);
                const ctx = canvas.getContext("2d");
                const background = await Canvas.loadImage("https://cdn.discordapp.com/attachments/1059089831604531243/1067877929016635412/giden.png");
                ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = "#3c3c3c";
                ctx.strokeRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = `#D3D3D3`;
                ctx.font = `37px "Warsaw"`;
                ctx.textAlign = "center";
                ctx.fillText(`${member.user.tag}`, 320, 300);
                let avatarImage;
                if (member.user.displayAvatarURL().endsWith(".webp")) {
                    avatarImage = await Canvas.loadImage(member.user.displayAvatarURL().replace("webp", "jpg"));
                } else {
                    avatarImage = await Canvas.loadImage(member.user.displayAvatarURL({ format: "jpg", size: 1024 }));
                }
                const boyut = 85, x = 325.5, y = 161;
                ctx.beginPath();
                ctx.arc(x, y, boyut, 0, 2 * Math.PI, false);
                ctx.clip();
                ctx.drawImage(avatarImage, (x - boyut), (y - boyut), (boyut * 2), (boyut * 2));
                const canvasgiris = new Discord.MessageAttachment(canvas.toBuffer(), { name: 'cikis.png' });
                giriscikiskanal.send({ content: `${member} sunucumuzdan çıktı! Sunucumuz **${member.guild.memberCount}** kişi kaldı.`, files: [canvasgiris] });
                if (member.user.bot) {
                    return giriscikiskanal.send(`Bu bir bot, ${member.user.tag}`);
                }
            }

            // HG/BB sistemi
            const hgbb1 = db.fetch(`hgbb1_${member.guild.id}`);
            const sayacmessage = db.fetch(`sayacmessage_${member.guild.id}`);
            if (hgbb1) {
                const kanal = member.guild.channels.cache.find(c => c.id === hgbb1.channel);
                if (sayacmessage) {
                    const cikismesaj = sayacmessage.leaveMsg
                        .replace("{guild.memberCount}", `${member.guild.memberCount}`)
                        .replace("{guild.name}", `${member.guild.name}`)
                        .replace("{owner.name}", `<@${member.guild.ownerId}>`)
                        .replace("{member}", `<@${member.user.id}>`);
                    const cikismesajs = new Discord.EmbedBuilder()
                        .setDescription(`${cikismesaj}`);
                    try {
                        kanal.send({ embeds: [cikismesajs] });
                    } catch (err) { }
                } else {
                    const normalmesaj = new Discord.EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('Görüşürüz')
                        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                        .setURL('https://example.com')
                        .setDescription(`📤 | ${member} Sunucudan ayrıldı.\n Ayrıldığı için onu sunucudan banladım. Durumun hatalı olduğunu düşünüyorsan , bir destek talebi oluşturup bize ulaşabilirsiniz.<#1232470508780523552>`)
                        .setImage('https://cdn.discordapp.com/attachments/1229368328523481141/1232407414729474109/Aler_6.png?ex=66295858&is=662806d8&hm=c763b2c29198f75f4ff11f7dfc118f6e71fdaea449a8333e7407dc23d509ce79&')
                        .setTimestamp();
                    try {
                        kanal.send({ embeds: [normalmesaj] });
                    } catch (err) { }
                }
            }

            if (db.fetch(`rcaptcha_${member.guild.id}`)) {
                if (db.fetch(`beklenıyor_${member.guild.id}${member.user.id}`)) return db.delete(`beklenıyor_${member.guild.id}${member.user.id}`);
                if (!db.fetch(`rcaptchaOnaylılar_${member.guild.id}`)) return;

                db.unpush(`rcaptchaOnaylılar_${member.guild.id}`, member.user.id);
            }

            const ayrildiLog = db.get(`ayrildiLog_${member.guild.id}`);
            const data = db.fetch(`ekledi_${member.id}`);
            if (data) {
                const botsdata = data;
                const unban = new Discord.EmbedBuilder()
                    .setColor("RED")
                    .setTitle("<✅ | Banlandı!")
                    .setDescription(`<@${member.id}>, sunucudan ayrıldığı için **botunu** sunucudan banladım!`);

                member.guild.members.ban(botsdata).catch(() => { });
                try {
                    const banLogChannel = member.guild.channels.cache.get(ayrildiLog);
                    if (banLogChannel) {
                        const logEmbed = new Discord.EmbedBuilder()
                            .setColor("RED")
                            .setTitle("Sunucudan Ayrılan Kullanıcı Banlandı")
                            .setDescription(`<@${member.id}> sunucudan ayrıldığı için botunu banladım.`);
                        banLogChannel.send({ embeds: [logEmbed] });
                    }
                    db.delete(`ekleniyor_${member.user.id}`);
                } catch (err) {
                    console.error("Ban logu gönderilirken bir hata oluştu:", err);
                }
            }
        } catch (err) {
            console.error("Bir hata oluştu:", err);
        }
    }
};
