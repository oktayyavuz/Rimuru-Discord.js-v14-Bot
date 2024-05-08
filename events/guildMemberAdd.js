const Discord = require("discord.js");
const db = require("croxydb");
const moment = require("moment");
const rp = require("../helpers/rcapchta");

module.exports = {
    name: "guildMemberAdd",

    run: async (client, member) => {
        const giriscikissystem = db.fetch(`canvaskanal_${member.guild.id}`);

        if (giriscikissystem) {
            const giriscikiskanal = member.guild.channels.cache.find(c => c.id === giriscikissystem.channel);

            const Canvas = require("canvas");
                
            const canvas = Canvas.createCanvas(648, 387);
            const ctx = canvas.getContext("2d");
          
            const background = await Canvas.loadImage("https://cdn.discordapp.com/attachments/1059089831604531243/1067877929251508376/gelen.png");
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
          
            ctx.strokeStyle = "#3c3c3c";
            ctx.strokeRect(0, 0, canvas.width, canvas.height);
          
            ctx.fillStyle = `#D3D3D3`;
            ctx.font = `37px "Warsaw"`;
            ctx.textAlign = "center";
            ctx.fillText(`${member.user.tag}`, 320, 300);
            
            let img;
            if (member.user.displayAvatarURL().endsWith(".webp")) {
                var avatar1 = member.user.displayAvatarURL();
                
                img = await Canvas.loadImage(avatar1.replace("webp", "jpg")); 
            } else {
                img = await Canvas.loadImage(member.user.displayAvatarURL({ format: "jpg", size: 1024 })); 
            }
          
            let boyut = 85, x = 325.5, y = 161;
            ctx.beginPath();
            ctx.arc(x, y, boyut, 0, 2 * Math.PI, false);
            ctx.clip();
            ctx.drawImage(img, (x - boyut), (y - boyut), (boyut * 2), (boyut * 2));
          
            const canvasgiris = new Discord.MessageAttachment(canvas.toBuffer(), { name: 'giris.png' });
            try {
                giriscikiskanal.send({ content: `${member} sunucumuza hoşgeldin! Sunucumuz **${member.guild.memberCount}** kişi oldu.`, files: [canvasgiris] });
            } catch(err) {
                console.error("Giriş çıkış kanalına mesaj gönderirken bir hata oluştu:", err);
            }
            
            if (member.user.bot) {
                try {
                    giriscikiskanal.send(`Bu bir bot, ${member.user.tag}`);
                } catch(err) {
                    console.error("Bot hakkında mesaj gönderirken bir hata oluştu:", err);
                }
            }
        }
        
        const hgbb = db.fetch(`hgbb_${member.guild.id}`);
        const sayacmessage = db.fetch(`sayacmessage_${member.guild.id}`);
        if (hgbb) {
            const kanal = member.guild.channels.cache.find(c => c.id === hgbb.channel);
            if (sayacmessage) {
                const girismesaj = sayacmessage.joinMsg
                    .replaceAll("{guild.memberCount}", `${member.guild.memberCount}`)
                    .replaceAll("{guild.name}", `${member.guild.name}`)
                    .replaceAll("{owner.name}", `<@${member.guild.ownerId}>`)
                    .replaceAll("{member}", `<@${member.user.id}>`);
        
                const girismesajs = new Discord.EmbedBuilder()
                    .setDescription(`${girismesaj}`);
                try {
                    kanal.send({ embeds: [girismesajs] });
                } catch(err) {
                    console.error("HGBB mesajı gönderirken bir hata oluştu:", err);
                }
            } else {
                const normalmesaj = new Discord.EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Hoşgeldin')
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                .setURL('https://example.com')
                .setDescription(`:inbox_tray: | ${member} Sunucumuza Katıldı! \n Sunucumuz **${member.guild.memberCount}** kişi oldu!`)
                .setImage('https://cdn.discordapp.com/attachments/1229368328523481141/1232405883795931198/Aler_5.png?ex=662956eb&is=6628056b&hm=ff2304be915d6e1b61f57318d44db4e4c2b1e632969238b25ef2dc44f57740ba&')
                .setTimestamp();
                try {
                    kanal.send({ embeds: [normalmesaj] });
                } catch(err) {
                    console.error("Normal mesaj gönderirken bir hata oluştu:", err);
                }
            }
        }

        const data = db.fetch(`ekleniyor_${member.user.id}${member.guild.id}`);

        if (member.user.bot && data) {
            try {
                let useravatar = await client.users.fetch(data.bot);
                let avatar = useravatar.avatar;
                let link = "https://cdn.discordapp.com/avatars/" + data.bot + "/" + avatar + ".png?size=1024";
                const embed = new Discord.EmbedBuilder()
                    .setTitle("<:tik:1039607067729727519> | Bot Onaylandı!")
                    .setDescription(`<@${data.bot}> adlı botun başvurusu kabul edildi!`)
                    .setThumbnail(link)
                    .setColor("Green");

                const user = await member.guild.members.cache.get(data.user);

                const botrole = db.fetch(`botRol_${member.guild.id}`);
                const userrole = db.fetch(`devRol_${member.guild.id}`);

                member.roles.add(botrole);
                user.roles.add(userrole);

                const log = db.fetch(`log_${member.guild.id}`);
                const channel = await member.guild.channels.cache.get(log);
                try {
                    channel.send({ content: `${user}`, embeds: [embed] });
                } catch(err) {
                    console.error("Bot onaylama işlemi sırasında bir hata oluştu:", err);
                }
                db.delete(`botSira_${member.guild.id}`, 1);
            } catch(err) {
                console.error("Bot bilgilerini getirirken bir hata oluştu:", err);
            }
        } 

        const tag = db.get(`ototag_${member.guild.id}`);
        if (tag) {
            member.setNickname(`${tag} | ${member.displayName}`).catch(console.error);
        }

        const acc = member.user.bot ? db.fetch(`botrol_${member.guild.id}`) : db.fetch(`otorol_${member.guild.id}`);
        if (acc) {
            member.roles.add(acc).catch(() => {});
        }

        // captcha sistemi
        if (db.fetch(`rcaptcha_${member.guild.id}`)) {
            const channel = member.guild.channels.cache.get(db.fetch(`rcaptcha_${member.guild.id}`).kanal);
            if (!channel) return;

            function randPassword(letters, numbers, either) {
                var chars = [
                    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
                    "0123456789",
                    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" // either
                ];

                return [letters, numbers, either].map(function (len, i) {
                    return Array(len).fill(chars[i]).map(function (x) {
                        return x[Math.floor(Math.random() * x.length)];
                    }).join('');
                }).concat().join('').split('').sort(function () {
                    return 0.5 - Math.random();
                }).join('');
            }
            const random = randPassword(3, 2, 1);

            const attachment = new Discord.MessageAttachment(rp(random), { name: `rcaptcha-${member.user.id}.png` });

            const row = new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId(`benıdogrula_everyone_${member.guild.id}${member.user.id}`)
                        .setLabel("Beni Doğrula")
                        .setEmoji("1026818020120723476")
                        .setStyle("SECONDARY"),
                    new Discord.MessageButton()
                        .setCustomId(`randomGöster_everyone_${member.guild.id}${member.user.id}`)
                        .setLabel("Kodu Görüntüle")
                        .setStyle("SECONDARY")
                );

            db.set(`beklenıyor_${member.guild.id}${member.user.id}`, random);
            try {
                channel.send({
                    content: `<@${member.user.id}>`, embeds: [
                        new Discord.EmbedBuilder()
                            .setColor("#36393F")
                            .setAuthor(client.user.tag, client.user.displayAvatarURL({ dynamic: true }))
                            .setDescription('• Merhaba Rimuru kullanıcısı, seni sunucumuza güvenle alabilmek için altta bulunan yazıyı butona tıklayarak yazman gerekiyor.')
                            .setImage("attachment://rcaptcha-" + member.user.id + ".png")
                            .setTimestamp()
                            .setFooter(member.user.tag, member.user.displayAvatarURL({ dynamic: true })) // Footer'ı düzeltildi
                    ], files: [attachment], components: [row], fetchReply: true
                });
            } catch(err) {
                console.error("Captcha mesajı gönderirken bir hata oluştu:", err);
            }
        }

        const uye = db.fetch(`kayıtlıuye_${member.id}`);
        if (uye) {
            const kayitsistemi = db.fetch(`kayıtsistemi_${member.guild.id}`);
            const registerChannel = member.guild.channels.cache.find(ch => ch.id === kayitsistemi.kayıtkanal);
            const kayıtlırol = member.guild.roles.cache.find(rl => rl.id === kayitsistemi.kayıtlırol);
            const kayıtsızrol = member.guild.roles.cache.find(rl => rl.id === kayitsistemi.kayıtsızrol);
            await member.setNickname(`${uye.isim} | ${uye.yas}`).catch(console.error);
            await member.roles.add(kayıtlırol).catch(console.error);
            await member.roles.remove(kayıtsızrol).catch(console.error);
            try {
                registerChannel.send({
                    embeds: [
                        {
                            description: `${member} sunucuya tekrar katıldı ve otomatik olarak kaydı yapıldı!`
                        }
                    ],
                });
            } catch(err) {
                console.error("Kayıt işlemi sırasında bir hata oluştu:", err);
            }
        }

        const hesapKoruma1 = db.fetch(`hesapkoruma1_${member.guild.id}`);
        if (hesapKoruma1) {
            const logChannel = member.guild.channels.cache.get(hesapKoruma1.channel);

            if (hesapKoruma1) {
                const now = new Date().getTime() - client.users.cache.get(member.id).createdAt.getTime() < 1296000000;
                if (now) {
                    try {
                        member.ban({ reason: "Yeni riskli hesap" });
                        logChannel.send({ 
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setDescription(`⚠️ | **${member.user.tag}**, Hesabı yeni olduğu için sunucudan yasaklandı.`)
                                    .setColor(`#FEE75C`)
                                    .setFooter({ text: `${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })

                            ]
                        });
                    } catch(err) {
                        console.error("Hesap koruma işlemi sırasında bir hata oluştu:", err);
                    }
                }
            } else {
                console.error("Hesap koruma kanalı bulunamadı.");
            }
        }
    }
};
