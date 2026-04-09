const db = require('croxydb');
const fs = require('fs');
const path = require('path');

/**
 * Gelişmiş veritabanı yönetimi için yardımcı sınıf
 */
class DatabaseManager {
    constructor() {
        this.db = db;
        this.cache = {};
        this.initializeCache();
    }

    /**
     * Önbelleği başlatır
     */
    initializeCache() {
        // Tüm veritabanı içeriğini önbelleğe al
        try {
            const allData = this.db.all();
            if (Array.isArray(allData)) {
                allData.forEach(entry => {
                    this.cache[entry.ID] = entry.data;
                });
            } else {
                // croxydb.all() bir dizi döndürmüyorsa, manuel dönüştürme yapalım
                const data = [];
                const keys = Object.keys(allData || {});
                keys.forEach(key => {
                    data.push({
                        ID: key,
                        data: allData[key]
                    });
                    this.cache[key] = allData[key];
                });
                return data;
            }
        } catch (error) {
            console.error("Veritabanı önbelleği başlatılırken hata:", error);
            return [];
        }
    }

    /**
     * Veritabanından veri alır, önbelleği kullanır
     * @param {string} key - Veritabanı anahtarı
     * @param {any} defaultValue - Varsayılan değer
     * @returns {any} Değer
     */
    get(key, defaultValue = null) {
        if (this.cache[key] !== undefined) {
            return this.cache[key];
        }
        
        const value = this.db.get(key) || defaultValue;
        this.cache[key] = value;
        return value;
    }

    /**
     * Veritabanına veri kaydeder ve önbelleği günceller
     * @param {string} key - Veritabanı anahtarı
     * @param {any} value - Kaydedilecek değer
     * @returns {any} Kaydedilen değer
     */
    set(key, value) {
        this.cache[key] = value;
        return this.db.set(key, value);
    }

    /**
     * Veritabanından veri siler ve önbelleği günceller
     * @param {string} key - Silinecek anahtar
     * @returns {boolean} Başarılı mı
     */
    delete(key) {
        delete this.cache[key];
        return this.db.delete(key);
    }

    /**
     * Belirli bir prefix ile başlayan tüm anahtarları alır
     * @param {string} prefix - Anahtar ön eki
     * @returns {object} Anahtar-değer çiftleri
     */
    getByPrefix(prefix) {
        const result = {};
        try {
            const allData = this.db.all();
            
            if (Array.isArray(allData)) {
                allData.forEach(entry => {
                    if (entry.ID.startsWith(prefix)) {
                        result[entry.ID] = entry.data;
                    }
                });
            } else {
                // Eğer all() bir dizi değil nesne döndürüyorsa
                Object.keys(allData || {}).forEach(key => {
                    if (key.startsWith(prefix)) {
                        result[key] = allData[key];
                    }
                });
            }
        } catch (error) {
            console.error(`getByPrefix hatası (${prefix}):`, error);
        }
        
        return result;
    }

    /**
     * Belirli bir prefixle başlayan tüm anahtarları siler
     * @param {string} prefix - Anahtar ön eki
     * @returns {number} Silinen anahtar sayısı
     */
    deleteByPrefix(prefix) {
        const keys = Object.keys(this.getByPrefix(prefix));
        let count = 0;
        
        keys.forEach(key => {
            if (this.delete(key)) {
                count++;
            }
        });
        
        return count;
    }

    /**
     * Sunucu ayarlarını alır
     * @param {string} guildId - Sunucu ID
     * @returns {object} Sunucu ayarları
     */
    getGuildSettings(guildId) {
        return {
            prefix: this.get(`prefix_${guildId}`),
            welcomeChannel: this.get(`hosgeldinKanal_${guildId}`),
            welcomeMessage: this.get(`hosgeldinMesaj_${guildId}`),
            leaveMessage: this.get(`gorusuruzMesaj_${guildId}`),
            modLogChannel: this.get(`modlogK_${guildId}`),
            autoRole: this.get(`otorol_${guildId}`),
            autoTag: this.get(`ototag_${guildId}`),
            levelSystem: this.get(`level_${guildId}`),
            customCommands: this.get(`customCommands_${guildId}`) || [],
            antiSwear: this.get(`kufur_${guildId}`),
            antiCapslock: this.get(`capslock_${guildId}`),
            antiAd: this.get(`reklam_${guildId}`),
            supportSystem: this.get(`destekSistemi_${guildId}`),
            warnSettings: this.get(`warnAyar_${guildId}`),
            mutedRole: this.get(`muteRol_${guildId}`),
            mediaChannel: this.get(`medyaKanal_${guildId}`)
        };
    }

    /**
     * Sunucu ayarlarını günceller
     * @param {string} guildId - Sunucu ID
     * @param {object} settings - Güncellenecek ayarlar
     */
    updateGuildSettings(guildId, settings) {
        const settingsMap = {
            prefix: `prefix_${guildId}`,
            welcomeChannel: `hosgeldinKanal_${guildId}`,
            welcomeMessage: `hosgeldinMesaj_${guildId}`,
            leaveMessage: `gorusuruzMesaj_${guildId}`,
            modLogChannel: `modlogK_${guildId}`,
            autoRole: `otorol_${guildId}`,
            autoTag: `ototag_${guildId}`,
            levelSystem: `level_${guildId}`,
            antiSwear: `kufur_${guildId}`,
            antiCapslock: `capslock_${guildId}`,
            antiAd: `reklam_${guildId}`,
            supportSystem: `destekSistemi_${guildId}`,
            warnSettings: `warnAyar_${guildId}`,
            mutedRole: `muteRol_${guildId}`,
            mediaChannel: `medyaKanal_${guildId}`
        };

        for (const [key, value] of Object.entries(settings)) {
            if (settingsMap[key]) {
                if (value === null || value === undefined) {
                    this.delete(settingsMap[key]);
                } else {
                    this.set(settingsMap[key], value);
                }
            }
        }

        // Özel olarak işlenmesi gereken ayarlar
        if (settings.customCommands !== undefined) {
            this.set(`customCommands_${guildId}`, settings.customCommands);
        }
    }

    /**
     * Tüm bot ayarlarını alır
     * @returns {object} Bot ayarları
     */
    getBotSettings() {
        return {
            globalPrefix: this.get('globalPrefix'),
            globalStatus: this.get('globalStatus'),
            globalLevelSystem: this.get('globalLevelSystem') !== false,
            mesajXp: this.get('mesajXp'),
            sesXp: this.get('sesXp'),
            levelXp: this.get('levelXp'),
            blacklistedUsers: this.get('blacklistedUsers') || [],
            blacklistedGuilds: this.get('blacklistedGuilds') || [],
            commandStats: this.get('commandStats') || {},
            botAcilis: this.get('botAcilis_')
        };
    }

    /**
     * Bot ayarlarını günceller
     * @param {object} settings - Güncellenecek ayarlar
     */
    updateBotSettings(settings) {
        const validKeys = [
            'globalPrefix', 
            'globalStatus', 
            'globalLevelSystem', 
            'mesajXp', 
            'sesXp', 
            'levelXp',
            'blacklistedUsers',
            'blacklistedGuilds',
            'commandStats'
        ];

        for (const [key, value] of Object.entries(settings)) {
            if (validKeys.includes(key)) {
                if (value === null || value === undefined) {
                    this.delete(key);
                } else {
                    this.set(key, value);
                }
            }
        }
    }

    /**
     * Kullanıcı seviye bilgilerini alır
     * @param {string} guildId - Sunucu ID
     * @param {string} userId - Kullanıcı ID
     * @returns {object} Seviye bilgileri
     */
    getUserLevelData(guildId, userId) {
        return this.get(`xp_${guildId}_${userId}`) || { 
            level: 0, 
            xp: 0, 
            totalXp: 0, 
            lastMessageTime: 0 
        };
    }

    /**
     * Kullanıcı seviye bilgilerini günceller
     * @param {string} guildId - Sunucu ID
     * @param {string} userId - Kullanıcı ID
     * @param {object} levelData - Seviye bilgileri
     */
    updateUserLevelData(guildId, userId, levelData) {
        this.set(`xp_${guildId}_${userId}`, levelData);
    }

    /**
     * Komut kullanım istatistiklerini günceller
     * @param {string} commandName - Komut adı
     */
    incrementCommandUsage(commandName) {
        const stats = this.get('commandStats') || {};
        stats[commandName] = (stats[commandName] || 0) + 1;
        this.set('commandStats', stats);
    }

    /**
     * En çok kullanılan komutları alır
     * @param {number} limit - Sınır
     * @returns {Array} Komut kullanım sıralaması
     */
    getTopCommands(limit = 10) {
        try {
            const stats = this.get('commandStats') || {};
            return Object.entries(stats)
                .map(([name, usage]) => ({ name, usage }))
                .sort((a, b) => b.usage - a.usage)
                .slice(0, limit);
        } catch (error) {
            console.error('getTopCommands hatası:', error);
            return [];
        }
    }

    /**
     * Sunucu seviye sıralamasını alır
     * @param {string} guildId - Sunucu ID
     * @param {number} limit - Sınır
     * @returns {Array} Seviye sıralaması
     */
    getLevelLeaderboard(guildId, limit = 10) {
        const leaderboard = [];
        try {
            const allData = this.db.all();
            
            if (Array.isArray(allData)) {
                allData.forEach(entry => {
                    if (entry.ID.startsWith(`xp_${guildId}_`)) {
                        const userId = entry.ID.split('_')[2];
                        leaderboard.push({
                            userId,
                            ...entry.data
                        });
                    }
                });
            } else {
                // Eğer all() bir dizi değil nesne döndürüyorsa
                Object.keys(allData || {}).forEach(key => {
                    if (key.startsWith(`xp_${guildId}_`)) {
                        const userId = key.split('_')[2];
                        leaderboard.push({
                            userId,
                            ...allData[key]
                        });
                    }
                });
            }
        } catch (error) {
            console.error(`getLevelLeaderboard hatası (${guildId}):`, error);
        }
        
        return leaderboard
            .sort((a, b) => b.totalXp - a.totalXp)
            .slice(0, limit);
    }

    /**
     * Veritabanını yedekler
     * @returns {string} Yedek dosya yolu
     */
    backup() {
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const backupDir = path.join(__dirname, '../backups');
        
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        const backupPath = path.join(backupDir, `backup-${timestamp}.json`);
        const data = JSON.stringify(this.db.all(), null, 2);
        
        fs.writeFileSync(backupPath, data);
        return backupPath;
    }

    /**
     * Yedeği geri yükler
     * @param {string} backupPath - Yedek dosya yolu
     * @returns {boolean} Başarılı mı
     */
    restore(backupPath) {
        try {
            const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
            
            // Mevcut veritabanını temizle
            const allData = this.db.all();
            if (Array.isArray(allData)) {
                allData.forEach(entry => {
                    this.db.delete(entry.ID);
                });
            }
            
            // Yedekten verileri yükle
            data.forEach(entry => {
                this.db.set(entry.ID, entry.data);
            });
            
            // Önbelleği yeniden başlat
            this.cache = {};
            this.initializeCache();
            
            return true;
        } catch (error) {
            console.error('Veritabanı geri yükleme hatası:', error);
            return false;
        }
    }
}

module.exports = new DatabaseManager(); 