const Discord = require("discord.js");
const db = require("croxydb");
const moment = require("moment");
const rp = require("../helpers/rcapchta");
const config = require("../config.json"); 

module.exports = {
    name: "guildMemberAdd",

    run: async (client, member) => {
        
        const hgbb = db.fetch(`hgbb_${member.guild.id}`);
        const sayacmessage = db.fetch(`sayacmessage_${member.guild.id}`);
        if (hgbb) {
            const channel = member.guild.channels.cache.find(c => c.id === hgbb.channel);
            if (sayacmessage) {
                const girismesaj = sayacmessage.joinMsg
                    .replaceAll("{guild.memberCount}", `${member.guild.memberCount}`)
                    .replaceAll("{guild.name}", `${member.guild.name}`)
                    .replaceAll("{owner.name}", `<@${member.guild.ownerId}>`)
                    .replaceAll("{member}", `<@${member.user.id}>`);
        
                const girismesajs = new Discord.EmbedBuilder()
                    .setDescription(`${girismesaj}`);
                try {
                    channel.send({ embeds: [girismesajs] });
                } catch(err) {
                    console.error("HGBB mesajı gönderirken bir hata oluştu:", err);
                }
            } else{
                const normalmeesage = new Discord.EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Hoşgeldin')
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                .setURL(`${config["website"]}`)
                .setDescription(`:inbox_tray: | ${member} Sunucumuza Katıldı! \n Sunucumuz **${member.guild.memberCount}** kişi oldu!`)
                .setImage('https://i.hizliresim.com/fp8i1ot.jpeg')
                .setTimestamp();
                try {
                    channel.send({ embeds: [normalmeesage] });
                } catch(err) {
                    console.error("Normal mesaj gönderirken bir hata oluştu.");
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
