const { EmbedBuilder } = require('discord.js');
const dbManager = require('../helpers/database');
const config = require('../config.json');

module.exports = {
  name: "messageCreate",
  run: async (client, message) => {
    try {
      if (message.author.bot || !message.guild) return;

      const guildId = message.guild.id;
      const userId = message.author.id;

      // XP sistemi etkin mi kontrol et
      const levelSystemEnabled = dbManager.get(`level_${guildId}`);
      const globalLevelSystemEnabled = dbManager.get('globalLevelSystem') !== false;

      if (levelSystemEnabled || globalLevelSystemEnabled) {
        const now = Date.now();
        const mesajXp = dbManager.get('mesajXp') || config.mesajXp || 5;

        // Kullanıcı XP verilerini al
        const userData = dbManager.getUserLevelData(guildId, userId);

        // Son mesajdan 60 saniye geçtiyse XP ver
        if (now - userData.lastMessageTime >= 60000) {
          userData.xp += mesajXp;
          userData.totalXp += mesajXp;
          userData.lastMessageTime = now;

          // Level atladı mı kontrol et
          const levelXp = dbManager.get('levelXp') || config.levelXp || 100;
          if (userData.xp >= levelXp * (userData.level + 1)) {
            userData.level += 1;
            userData.xp = 0;

            // Level atlama mesajı
            const levelUpChannel = dbManager.get(`levelKanal_${guildId}`);
            const embed = new EmbedBuilder()
              .setColor('#3498db')
              .setTitle('🎉 Seviye Atladın!')
              .setDescription(`Tebrikler <@${userId}>! **Level ${userData.level}** oldun.`)
              .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
              .setTimestamp();

            if (levelUpChannel) {
              const channel = message.guild.channels.cache.get(levelUpChannel);
              if (channel) {
                channel.send({ embeds: [embed] }).catch(() => { });
              }
            } else {
              message.channel.send({ embeds: [embed] }).catch(() => { });
            }

            // Level rolü kontrolü
            const levelRoles = dbManager.get(`levelRoller_${guildId}`);
            if (levelRoles && Array.isArray(levelRoles)) {
              for (const roleData of levelRoles) {
                if (userData.level >= roleData.level) {
                  const member = message.member || await message.guild.members.fetch(userId).catch(() => null);
                  if (member && !member.roles.cache.has(roleData.roleId)) {
                    member.roles.add(roleData.roleId).catch(console.error);
                  }
                }
              }
            }
          }

          // Veritabanını güncelle
          dbManager.updateUserLevelData(guildId, userId, userData);
        }
      }
    } catch (error) {
      console.error('Level sistemi hatası (mesaj):', error);
    }
  }
};

// Ses kanalı XP sistemi için voiceStateUpdate olayı
module.exports.voiceEvent = {
  name: "voiceStateUpdate",
  run: async (client, oldState, newState) => {
    try {
      if (newState.member.user.bot) return;

      const userId = newState.member.user.id;
      const guildId = newState.guild.id;

      // XP sistemi etkin mi kontrol et
      const levelSystemEnabled = dbManager.get(`level_${guildId}`);
      const globalLevelSystemEnabled = dbManager.get('globalLevelSystem') !== false;

      if (levelSystemEnabled || globalLevelSystemEnabled) {
        // Kullanıcı ses kanalına girdiyse
        if (!oldState.channelId && newState.channelId) {
          // AFK kanalı kontrolü
          if (newState.channel.name.toLowerCase().includes('afk')) return;
          dbManager.set(`voiceJoinTime_${guildId}_${userId}`, Date.now());
        }
        // Kullanıcı ses kanalından çıktıysa veya kanal değiştirdiyse
        else if (oldState.channelId && (!newState.channelId || oldState.channelId !== newState.channelId)) {
          const joinTime = dbManager.get(`voiceJoinTime_${guildId}_${userId}`);
          if (joinTime) {
            const leaveTime = Date.now();
            const voiceTimeInMinutes = Math.floor((leaveTime - joinTime) / 60000);

            if (voiceTimeInMinutes > 0) {
              const userData = dbManager.getUserLevelData(guildId, userId);
              const sesXp = dbManager.get('sesXp') || config.sesXp || 10;

              // Her dakika için XP ekle
              const earnedXp = voiceTimeInMinutes * sesXp;
              userData.xp += earnedXp;
              userData.totalXp += earnedXp;

              // Level atladı mı kontrol et
              const levelXp = dbManager.get('levelXp') || config.levelXp || 100;
              if (userData.xp >= levelXp * (userData.level + 1)) {
                userData.level += 1;
                userData.xp = 0;

                // DM veya Kanal ile bildir
                const embed = new EmbedBuilder()
                  .setColor('#3498db')
                  .setTitle('🎉 Ses Kanalında Seviye Atladın!')
                  .setDescription(`**${newState.guild.name}** sunucusunda ses aktivitenden dolayı **Level ${userData.level}** oldun!`)
                  .setTimestamp();

                newState.member.send({ embeds: [embed] }).catch(() => { });

                // Level rolü kontrolü
                const levelRoles = dbManager.get(`levelRoller_${guildId}`);
                if (levelRoles && Array.isArray(levelRoles)) {
                  for (const roleData of levelRoles) {
                    if (userData.level >= roleData.level) {
                      if (!newState.member.roles.cache.has(roleData.roleId)) {
                        newState.member.roles.add(roleData.roleId).catch(console.error);
                      }
                    }
                  }
                }
              }

              // Veritabanını güncelle
              dbManager.updateUserLevelData(guildId, userId, userData);
            }

            // Temizle veya yeni katıldıysa güncelle
            if (!newState.channelId || newState.channel.name.toLowerCase().includes('afk')) {
              dbManager.delete(`voiceJoinTime_${guildId}_${userId}`);
            } else {
              dbManager.set(`voiceJoinTime_${guildId}_${userId}`, Date.now());
            }
          } else if (newState.channelId && !newState.channel.name.toLowerCase().includes('afk')) {
            // Yeni bir kanala girdiyse (eskiden AFK'daydı veya tracker kayboldu)
            dbManager.set(`voiceJoinTime_${guildId}_${userId}`, Date.now());
          }
        }
      }
    } catch (error) {
      console.error('Level sistemi hatası (ses):', error);
    }
  }
};
