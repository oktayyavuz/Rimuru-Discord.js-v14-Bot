const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const path = require('path');
const fs = require('fs');
const dbManager = require('../helpers/database');
const bodyParser = require('body-parser');
const config = require('../config.json');

module.exports = function (client) {
    const app = express();

    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    app.use(session({
        secret: config.panel.gizliAnahtar || 'your-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 60000 * 60 * 24 
        }
    }));

    app.use(require('connect-flash')());

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));

    passport.use(new DiscordStrategy({
        clientID: config["bot-id"],
        clientSecret: process.env.CLIENT_SECRET || config.clientSecret,
        callbackURL: 'http://localhost:3000/auth/discord/callback',
        scope: ['identify', 'guilds']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            return done(null, profile);
        } catch (error) {
            return done(error, null);
        }
    }));

    passport.use('local', new (require('passport-local').Strategy)({
        usernameField: 'username',
        passwordField: 'password'
    }, (username, password, done) => {
        if (username === config.panel.kullaniciAdi && password === config.panel.sifre) {
            return done(null, { id: 'admin', username: 'admin', isAdmin: true });
        }
        return done(null, false, { message: 'Kullanıcı adı veya şifre hatalı' });
    }));

    const checkAuth = (req, res, next) => {
        if (req.isAuthenticated()) return next();
        res.redirect('/login');
    };

    const checkAdmin = (req, res, next) => {
        if (req.isAuthenticated() && req.user.isAdmin) return next();
        res.status(403).render('error', { error: 'Bu sayfaya erişim yetkiniz yok', user: req.user });
    };

    const checkBotOwner = (req, res, next) => {
        if (req.isAuthenticated() && req.user.id === config.sahip) return next();
        res.status(403).render('error', { error: 'Bu sayfaya erişim yetkiniz yok', user: req.user });
    };

    const checkPermission = (req, res, next) => {
        if (!req.isAuthenticated()) return res.redirect('/login');

        if (req.user.isAdmin || req.user.id === config.sahip) return next();

        const guildId = req.params.guildId;
        if (!guildId) return res.status(400).render('error', { error: 'Sunucu ID bulunamadı', user: req.user });

        const guild = req.user.guilds.find(g => g.id === guildId);
        if (!guild) return res.status(404).render('error', { error: 'Sunucu bulunamadı', user: req.user });

        const isAdmin = (guild.permissions & 0x8) === 0x8;
        const canManageGuild = (guild.permissions & 0x20) === 0x20;

        if (isAdmin || canManageGuild) return next();

        res.status(403).render('error', { error: 'Bu sunucuyu yönetme yetkiniz yok', user: req.user });
    };

    app.get('/', (req, res) => {
        res.render('index', { user: req.user });
    });
    app.get('/login', (req, res) => {
        if (req.isAuthenticated()) return res.redirect('/dashboard');
        res.render('login');
    });

    app.post('/login/admin', passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
    }));

    app.get('/auth/discord', passport.authenticate('discord'));

    app.get('/auth/discord/callback',
        passport.authenticate('discord', { failureRedirect: '/login' }),
        (req, res) => res.redirect('/dashboard')
    );

    app.get('/logout', (req, res) => {
        req.logout(() => {
            res.redirect('/');
        });
    });

    app.get('/dashboard', checkAuth, (req, res) => {
        const botStatus = {
            uptime: client.uptime,
            guildCount: client.guilds.cache.size,
            userCount: client.users.cache.size,
            channelCount: client.channels.cache.size,
            commandCount: client.commands.length,
            ping: client.ws.ping
        };

        let guilds = [];
        if (req.user.guilds) {
            guilds = req.user.guilds
                .filter(guild => {
                    const isAdmin = (guild.permissions & 0x8) === 0x8;
                    const canManageGuild = (guild.permissions & 0x20) === 0x20;
                    return isAdmin || canManageGuild;
                })
                .map(guild => {
                    const botInGuild = client.guilds.cache.has(guild.id);
                    return { ...guild, botInGuild };
                })
                .sort((a, b) => b.botInGuild - a.botInGuild);
        }

        const popularCommands = dbManager.getTopCommands(5);

        res.render('dashboard', {
            user: req.user,
            botStatus,
            guilds,
            popularCommands,
            isAdmin: req.user.isAdmin || req.user.id === config.sahip
        });
    });

    app.get('/dashboard/servers', checkAuth, (req, res) => {
        let guilds = [];
        if (req.user.guilds) {
            guilds = req.user.guilds
                .filter(guild => {
                    const isAdmin = (guild.permissions & 0x8) === 0x8;
                    const canManageGuild = (guild.permissions & 0x20) === 0x20;
                    return isAdmin || canManageGuild;
                })
                .map(guild => {
                    const botInGuild = client.guilds.cache.has(guild.id);
                    return { ...guild, botInGuild };
                })
                .sort((a, b) => b.botInGuild - a.botInGuild);
        }

        res.render('servers', {
            user: req.user,
            guilds,
            isAdmin: req.user.isAdmin || req.user.id === config.sahip
        });
    });

    app.get('/dashboard/server/:guildId', checkPermission, (req, res) => {
        const guildId = req.params.guildId;
        const guild = client.guilds.cache.get(guildId);

        if (!guild) {
            return res.status(404).render('error', {
                error: 'Sunucu bulunamadı veya bot bu sunucuda bulunmuyor',
                user: req.user
            });
        }

        const settings = dbManager.getGuildSettings(guildId);

        const levelLeaderboard = dbManager.getLevelLeaderboard(guildId, 10);

        const leaderboardWithUsers = levelLeaderboard.map(userData => {
            const member = guild.members.cache.get(userData.userId);
            return {
                ...userData,
                username: member ? member.user.username : 'Bilinmeyen Kullanıcı',
                avatar: member ? member.user.displayAvatarURL({ dynamic: true }) : null
            };
        });

        res.render('server', {
            user: req.user,
            guild,
            settings,
            leaderboard: leaderboardWithUsers,
            channels: guild.channels.cache.filter(c => c.type === 0).map(c => ({ id: c.id, name: c.name })),
            roles: guild.roles.cache.map(r => ({ id: r.id, name: r.name, color: r.hexColor }))
        });
    });

    app.post('/api/server/:guildId/settings', checkPermission, (req, res) => {
        const guildId = req.params.guildId;
        const { setting, value } = req.body;

        if (!guildId || !setting) {
            return res.status(400).json({ error: 'Eksik parametreler' });
        }

        try {
            const updateSettings = {};
            updateSettings[setting] = value === 'true' ? true :
                value === 'false' ? false :
                    value === '' ? null : value;

            dbManager.updateGuildSettings(guildId, updateSettings);

            res.json({ success: true, message: 'Ayar başarıyla güncellendi' });
        } catch (error) {
            console.error('Ayar güncellenirken hata:', error);
            res.status(500).json({ error: 'Ayar güncellenirken bir hata oluştu' });
        }
    });

    app.get('/dashboard/server/:guildId/levels', checkPermission, (req, res) => {
        const guildId = req.params.guildId;
        const guild = client.guilds.cache.get(guildId);

        if (!guild) {
            return res.status(404).render('error', {
                error: 'Sunucu bulunamadı veya bot bu sunucuda bulunmuyor',
                user: req.user
            });
        }

        const levelLeaderboard = dbManager.getLevelLeaderboard(guildId);

        const leaderboardWithUsers = levelLeaderboard.map(userData => {
            const member = guild.members.cache.get(userData.userId);
            return {
                ...userData,
                username: member ? member.user.username : 'Bilinmeyen Kullanıcı',
                avatar: member ? member.user.displayAvatarURL({ dynamic: true }) : null
            };
        });

        const levelRoles = dbManager.get(`levelRoller_${guildId}`) || [];

        res.render('server-levels', {
            user: req.user,
            guild,
            leaderboard: leaderboardWithUsers,
            levelRoles,
            roles: guild.roles.cache.map(r => ({ id: r.id, name: r.name, color: r.hexColor })),
            levelSystemEnabled: dbManager.get(`level_${guildId}`) === true,
            levelUpChannel: dbManager.get(`levelKanal_${guildId}`),
            channels: guild.channels.cache.filter(c => c.type === 0).map(c => ({ id: c.id, name: c.name }))
        });
    });

    app.post('/api/server/:guildId/level-roles', checkPermission, (req, res) => {
        const guildId = req.params.guildId;
        const { roleId, level } = req.body;

        if (!guildId || !roleId || !level) {
            return res.status(400).json({ error: 'Eksik parametreler' });
        }

        try {
            const levelRoles = dbManager.get(`levelRoller_${guildId}`) || [];

            const existingRoleIndex = levelRoles.findIndex(r => r.roleId === roleId);
            if (existingRoleIndex !== -1) {
                levelRoles[existingRoleIndex].level = parseInt(level);
            } else {
                levelRoles.push({
                    roleId,
                    level: parseInt(level)
                });
            }

            levelRoles.sort((a, b) => a.level - b.level);

            dbManager.set(`levelRoller_${guildId}`, levelRoles);

            res.json({ success: true, message: 'Seviye rolü başarıyla güncellendi' });
        } catch (error) {
            console.error('Seviye rolü güncellenirken hata:', error);
            res.status(500).json({ error: 'Seviye rolü güncellenirken bir hata oluştu' });
        }
    });

    app.delete('/api/server/:guildId/level-roles/:roleId', checkPermission, (req, res) => {
        const guildId = req.params.guildId;
        const roleId = req.params.roleId;

        if (!guildId || !roleId) {
            return res.status(400).json({ error: 'Eksik parametreler' });
        }

        try {
            let levelRoles = dbManager.get(`levelRoller_${guildId}`) || [];

            levelRoles = levelRoles.filter(r => r.roleId !== roleId);

            dbManager.set(`levelRoller_${guildId}`, levelRoles);

            res.json({ success: true, message: 'Seviye rolü başarıyla silindi' });
        } catch (error) {
            console.error('Seviye rolü silinirken hata:', error);
            res.status(500).json({ error: 'Seviye rolü silinirken bir hata oluştu' });
        }
    });

    app.post('/api/server/:guildId/user/:userId/xp', checkPermission, (req, res) => {
        const guildId = req.params.guildId;
        const userId = req.params.userId;
        const { xp, level } = req.body;

        if (!guildId || !userId || (xp === undefined && level === undefined)) {
            return res.status(400).json({ error: 'Eksik parametreler' });
        }

        try {
            const userData = dbManager.getUserLevelData(guildId, userId);

            if (xp !== undefined) {
                userData.xp = parseInt(xp);
                userData.totalXp = (userData.level * dbManager.get('levelXp') || 100) + parseInt(xp);
            }

            if (level !== undefined) {
                userData.level = parseInt(level);
                userData.totalXp = (parseInt(level) * (dbManager.get('levelXp') || 100)) + userData.xp;
            }

            dbManager.updateUserLevelData(guildId, userId, userData);

            res.json({ success: true, message: 'Kullanıcı XP bilgisi başarıyla güncellendi' });
        } catch (error) {
            console.error('Kullanıcı XP güncellenirken hata:', error);
            res.status(500).json({ error: 'Kullanıcı XP güncellenirken bir hata oluştu' });
        }
    });

    app.get('/dashboard/commands', checkAuth, (req, res) => {
        try {
            const commandFiles = fs.readdirSync(path.join(__dirname, '../commands'))
                .filter(file => file.endsWith('.js'));

            const commands = commandFiles.map(file => {
                const command = require(`../commands/${file}`);
                return {
                    name: command.name,
                    description: command.description,
                    options: command.options,
                    category: getCommandCategory(command.name),
                    usage: dbManager.get('commandStats') ? dbManager.get('commandStats')[command.name] || 0 : 0
                };
            });

            const categories = {
                moderasyon: commands.filter(cmd => cmd.category === 'moderasyon'),
                kayit: commands.filter(cmd => cmd.category === 'kayit'),
                kullanici: commands.filter(cmd => cmd.category === 'kullanici'),
                sistemler: commands.filter(cmd => cmd.category === 'sistemler'),
                koruma: commands.filter(cmd => cmd.category === 'koruma'),
                muzik: commands.filter(cmd => cmd.category === 'muzik'),
                diger: commands.filter(cmd => cmd.category === 'diger')
            };

            res.render('commands', {
                user: req.user,
                categories,
                isAdmin: req.user.isAdmin || req.user.id === config.sahip
            });
        } catch (error) {
            console.error('Komutlar yüklenirken hata:', error);
            res.status(500).render('error', { error: 'Komutlar yüklenirken bir hata oluştu', user: req.user });
        }
    });

    app.get('/dashboard/command/:commandName', checkAuth, (req, res) => {
        const commandName = req.params.commandName;

        try {
            // Komut dosyasını kontrol et
            const commandPath = path.join(__dirname, '../commands', `${commandName}.js`);

            if (!fs.existsSync(commandPath)) {
                return res.status(404).render('error', { error: 'Komut bulunamadı', user: req.user });
            }

            const command = require(commandPath);
            const commandContent = fs.readFileSync(commandPath, 'utf8');
            const usage = dbManager.get('commandStats') ? dbManager.get('commandStats')[commandName] || 0 : 0;

            res.render('command', {
                user: req.user,
                command,
                commandContent,
                usage,
                isAdmin: req.user.isAdmin || req.user.id === config.sahip
            });
        } catch (error) {
            console.error('Komut detayları yüklenirken hata:', error);
            res.status(500).render('error', { error: 'Komut detayları yüklenirken bir hata oluştu', user: req.user });
        }
    });

    app.post('/api/command/:commandName', checkBotOwner, (req, res) => {
        const commandName = req.params.commandName;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Komut içeriği boş olamaz' });
        }

        try {
            const commandPath = path.join(__dirname, '../commands', `${commandName}.js`);

            if (!fs.existsSync(commandPath)) {
                return res.status(404).json({ error: 'Komut bulunamadı' });
            }

            fs.writeFileSync(commandPath, content, 'utf8');

            delete require.cache[require.resolve(commandPath)];
            const updatedCommand = require(commandPath);
            const commandIndex = client.commands.findIndex(cmd => cmd.name === updatedCommand.name);
            if (commandIndex !== -1) {
                client.commands[commandIndex] = {
                    name: updatedCommand.name.toLowerCase(),
                    description: updatedCommand.description.toLowerCase(),
                    options: updatedCommand.options,
                    dm_permission: false,
                    type: 1
                };
            }

            res.json({ success: true, message: 'Komut başarıyla güncellendi' });
        } catch (error) {
            console.error('Komut güncellenirken hata:', error);
            res.status(500).json({ error: 'Komut güncellenirken bir hata oluştu' });
        }
    });

    app.get('/dashboard/server/:guildId/custom-commands', checkPermission, (req, res) => {
        const guildId = req.params.guildId;
        const guild = client.guilds.cache.get(guildId);

        if (!guild) {
            return res.status(404).render('error', {
                error: 'Sunucu bulunamadı veya bot bu sunucuda bulunmuyor',
                user: req.user
            });
        }

        const customCommands = dbManager.get(`customCommands_${guildId}`) || [];

        res.render('custom-commands', {
            user: req.user,
            guild,
            customCommands,
            isAdmin: req.user.isAdmin || req.user.id === config.sahip
        });
    });

    app.post('/api/server/:guildId/custom-commands', checkPermission, (req, res) => {
        const guildId = req.params.guildId;
        const { name, response, isRegex } = req.body;

        if (!guildId || !name || !response) {
            return res.status(400).json({ error: 'Eksik parametreler' });
        }

        try {
            const customCommands = dbManager.get(`customCommands_${guildId}`) || [];

            // Komutu kontrol et ve güncelle veya ekle
            const existingCommandIndex = customCommands.findIndex(c => c.name === name);
            if (existingCommandIndex !== -1) {
                customCommands[existingCommandIndex] = {
                    name,
                    response,
                    isRegex: isRegex === 'true' || isRegex === true
                };
            } else {
                customCommands.push({
                    name,
                    response,
                    isRegex: isRegex === 'true' || isRegex === true
                });
            }

            // Veritabanını güncelle
            dbManager.set(`customCommands_${guildId}`, customCommands);

            res.json({ success: true, message: 'Özel komut başarıyla güncellendi' });
        } catch (error) {
            console.error('Özel komut güncellenirken hata:', error);
            res.status(500).json({ error: 'Özel komut güncellenirken bir hata oluştu' });
        }
    });

    // Özel Komut Sil
    app.delete('/api/server/:guildId/custom-commands/:commandName', checkPermission, (req, res) => {
        const guildId = req.params.guildId;
        const commandName = req.params.commandName;

        if (!guildId || !commandName) {
            return res.status(400).json({ error: 'Eksik parametreler' });
        }

        try {
            let customCommands = dbManager.get(`customCommands_${guildId}`) || [];

            // Komutu filtrele
            customCommands = customCommands.filter(c => c.name !== commandName);

            // Veritabanını güncelle
            dbManager.set(`customCommands_${guildId}`, customCommands);

            res.json({ success: true, message: 'Özel komut başarıyla silindi' });
        } catch (error) {
            console.error('Özel komut silinirken hata:', error);
            res.status(500).json({ error: 'Özel komut silinirken bir hata oluştu' });
        }
    });

    // Sistem Ayarları
    app.get('/dashboard/settings', checkBotOwner, (req, res) => {
        // Genel bot ayarlarını al
        const botSettings = dbManager.getBotSettings();

        // Yedekleri kontrol et
        let backups = [];
        const backupDir = path.join(__dirname, '../backups');
        if (fs.existsSync(backupDir)) {
            backups = fs.readdirSync(backupDir)
                .filter(file => file.endsWith('.json'))
                .map(file => {
                    const filePath = path.join(backupDir, file);
                    const stats = fs.statSync(filePath);
                    return {
                        name: file,
                        path: filePath,
                        size: Math.round(stats.size / 1024), // KB cinsinden boyut
                        date: stats.mtime
                    };
                })
                .sort((a, b) => b.date - a.date); // En yeni en üstte
        }

        // Kara liste kullanıcıları ve sunucular için detaylı bilgi ekle
        const blacklistedUsersWithInfo = botSettings.blacklistedUsers.map(userId => {
            const user = client.users.cache.get(userId);
            return {
                id: userId,
                username: user ? user.username : 'Bilinmeyen Kullanıcı',
                avatar: user ? user.displayAvatarURL({ dynamic: true }) : null
            };
        });

        const blacklistedGuildsWithInfo = botSettings.blacklistedGuilds.map(guildId => {
            const guild = client.guilds.cache.get(guildId);
            return {
                id: guildId,
                name: guild ? guild.name : 'Bilinmeyen Sunucu',
                icon: guild ? guild.iconURL({ dynamic: true }) : null
            };
        });

        res.render('settings', {
            user: req.user,
            botSettings: {
                ...botSettings,
                blacklistedUsers: blacklistedUsersWithInfo,
                blacklistedGuilds: blacklistedGuildsWithInfo
            },
            backups,
            isAdmin: req.user.isAdmin || req.user.id === config.sahip
        });
    });

    // Bot ayarları güncelleme (sadece bot sahibi)
    app.post('/api/settings', checkBotOwner, (req, res) => {
        const { setting, value } = req.body;

        if (!setting) {
            return res.status(400).json({ error: 'Eksik parametreler' });
        }

        try {
            const updateSettings = {};
            updateSettings[setting] = value === 'true' ? true :
                value === 'false' ? false :
                    value === '' ? null : value;

            // Özel durumlar
            if (setting === 'globalStatus' && value) {
                client.user.setActivity(value);
            }

            dbManager.updateBotSettings(updateSettings);

            // Config dosyasını da güncelle
            if (['prefix', 'durum', 'mesajXp', 'sesXp', 'levelXp'].includes(setting)) {
                const configSetting = setting === 'prefix' ? 'prefix' :
                    setting === 'durum' ? 'durum' :
                        setting;

                config[configSetting] = value;
                fs.writeFileSync(path.join(__dirname, '../config.json'), JSON.stringify(config, null, 2), 'utf8');
            }

            res.json({ success: true, message: 'Ayar başarıyla güncellendi' });
        } catch (error) {
            console.error('Ayar güncellenirken hata:', error);
            res.status(500).json({ error: 'Ayar güncellenirken bir hata oluştu' });
        }
    });

    // Kara listeye kullanıcı ekle
    app.post('/api/blacklist/user', checkBotOwner, (req, res) => {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'Kullanıcı ID gerekli' });
        }

        try {
            const blacklistedUsers = dbManager.get('blacklistedUsers') || [];

            // Kara listede var mı kontrol et
            if (blacklistedUsers.includes(userId)) {
                return res.status(400).json({ error: 'Kullanıcı zaten kara listede' });
            }

            // Kara listeye ekle
            blacklistedUsers.push(userId);
            dbManager.set('blacklistedUsers', blacklistedUsers);

            res.json({ success: true, message: 'Kullanıcı kara listeye eklendi' });
        } catch (error) {
            console.error('Kara liste güncellenirken hata:', error);
            res.status(500).json({ error: 'Kara liste güncellenirken bir hata oluştu' });
        }
    });

    // Kara listeden kullanıcı çıkar
    app.delete('/api/blacklist/user/:userId', checkBotOwner, (req, res) => {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'Kullanıcı ID gerekli' });
        }

        try {
            let blacklistedUsers = dbManager.get('blacklistedUsers') || [];

            // Kara listeden çıkar
            blacklistedUsers = blacklistedUsers.filter(id => id !== userId);
            dbManager.set('blacklistedUsers', blacklistedUsers);

            res.json({ success: true, message: 'Kullanıcı kara listeden çıkarıldı' });
        } catch (error) {
            console.error('Kara liste güncellenirken hata:', error);
            res.status(500).json({ error: 'Kara liste güncellenirken bir hata oluştu' });
        }
    });

    // Kara listeye sunucu ekle
    app.post('/api/blacklist/guild', checkBotOwner, (req, res) => {
        const { guildId } = req.body;

        if (!guildId) {
            return res.status(400).json({ error: 'Sunucu ID gerekli' });
        }

        try {
            const blacklistedGuilds = dbManager.get('blacklistedGuilds') || [];

            // Kara listede var mı kontrol et
            if (blacklistedGuilds.includes(guildId)) {
                return res.status(400).json({ error: 'Sunucu zaten kara listede' });
            }

            // Kara listeye ekle
            blacklistedGuilds.push(guildId);
            dbManager.set('blacklistedGuilds', blacklistedGuilds);

            // Botun sunucudan çıkmasını sağla
            const guild = client.guilds.cache.get(guildId);
            if (guild) {
                guild.leave().catch(console.error);
            }

            res.json({ success: true, message: 'Sunucu kara listeye eklendi' });
        } catch (error) {
            console.error('Kara liste güncellenirken hata:', error);
            res.status(500).json({ error: 'Kara liste güncellenirken bir hata oluştu' });
        }
    });

    // Kara listeden sunucu çıkar
    app.delete('/api/blacklist/guild/:guildId', checkBotOwner, (req, res) => {
        const { guildId } = req.params;

        if (!guildId) {
            return res.status(400).json({ error: 'Sunucu ID gerekli' });
        }

        try {
            let blacklistedGuilds = dbManager.get('blacklistedGuilds') || [];

            // Kara listeden çıkar
            blacklistedGuilds = blacklistedGuilds.filter(id => id !== guildId);
            dbManager.set('blacklistedGuilds', blacklistedGuilds);

            res.json({ success: true, message: 'Sunucu kara listeden çıkarıldı' });
        } catch (error) {
            console.error('Kara liste güncellenirken hata:', error);
            res.status(500).json({ error: 'Kara liste güncellenirken bir hata oluştu' });
        }
    });

    // Veritabanı yedekleme
    app.post('/api/backup', checkBotOwner, (req, res) => {
        try {
            const backupPath = dbManager.backup();

            res.json({
                success: true,
                message: 'Veritabanı başarıyla yedeklendi',
                backup: {
                    name: path.basename(backupPath),
                    path: backupPath,
                    date: new Date()
                }
            });
        } catch (error) {
            console.error('Veritabanı yedeklenirken hata:', error);
            res.status(500).json({ error: 'Veritabanı yedeklenirken bir hata oluştu' });
        }
    });

    // Veritabanı geri yükleme
    app.post('/api/restore', checkBotOwner, (req, res) => {
        const { backupPath } = req.body;

        if (!backupPath) {
            return res.status(400).json({ error: 'Yedek dosya yolu gerekli' });
        }

        try {
            const success = dbManager.restore(backupPath);

            if (success) {
                res.json({ success: true, message: 'Veritabanı başarıyla geri yüklendi' });
            } else {
                res.status(500).json({ error: 'Veritabanı geri yüklenirken bir hata oluştu' });
            }
        } catch (error) {
            console.error('Veritabanı geri yüklenirken hata:', error);
            res.status(500).json({ error: 'Veritabanı geri yüklenirken bir hata oluştu' });
        }
    });

    // İstatistikler
    app.get('/dashboard/stats', checkAuth, (req, res) => {
        // Bot istatistiklerini al
        const stats = {
            uptime: client.uptime,
            guildCount: client.guilds.cache.size,
            userCount: client.users.cache.size,
            channelCount: client.channels.cache.size,
            commandCount: client.commands.length,
            ping: client.ws.ping,
            memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
            botStartTime: dbManager.get("botAcilis_")
        };

        // Popüler komutlar
        const popularCommands = dbManager.getTopCommands(10);

        // En büyük sunucular
        const topGuilds = [...client.guilds.cache.values()]
            .sort((a, b) => b.memberCount - a.memberCount)
            .slice(0, 5)
            .map(guild => ({
                id: guild.id,
                name: guild.name,
                memberCount: guild.memberCount,
                icon: guild.iconURL({ dynamic: true }),
                botAddedAt: guild.joinedAt
            }));

        // Sunucu büyüme grafiği için test verileri (gerçek uygulama için sunucu sayısı günlük olarak kaydedilmeli)
        const serverGrowthData = {
            labels: Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                return date.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });
            }),
            datasets: [
                {
                    label: 'Sunucu Sayısı',
                    data: [
                        Math.max(0, stats.guildCount - Math.floor(Math.random() * 10) - 25),
                        Math.max(0, stats.guildCount - Math.floor(Math.random() * 10) - 20),
                        Math.max(0, stats.guildCount - Math.floor(Math.random() * 10) - 15),
                        Math.max(0, stats.guildCount - Math.floor(Math.random() * 10) - 10),
                        Math.max(0, stats.guildCount - Math.floor(Math.random() * 10) - 5),
                        Math.max(0, stats.guildCount - Math.floor(Math.random() * 5)),
                        stats.guildCount
                    ]
                }
            ]
        };

        res.render('stats', {
            user: req.user,
            stats,
            popularCommands,
            topGuilds,
            serverGrowthData: JSON.stringify(serverGrowthData),
            isAdmin: req.user.isAdmin || req.user.id === config.sahip
        });
    });

    // API Routes
    app.get('/api/guilds', checkAuth, (req, res) => {
        if (!req.user.guilds) return res.json([]);

        const guilds = req.user.guilds
            .filter(guild => {
                const isAdmin = (guild.permissions & 0x8) === 0x8;
                const canManageGuild = (guild.permissions & 0x20) === 0x20;
                return isAdmin || canManageGuild;
            })
            .map(guild => {
                const botInGuild = client.guilds.cache.has(guild.id);
                return { ...guild, botInGuild };
            });

        res.json(guilds);
    });

    app.get('/api/activities', checkAuth, (req, res) => {
        // Bu örnek veri, gerçek uygulamada aktivite logları tutulabilir
        const activities = [
            { date: new Date(Date.now() - 3600000), action: 'Komut Çalıştırıldı', server: 'Test Sunucusu', status: 'Success' },
            { date: new Date(Date.now() - 7200000), action: 'Ayar Değiştirildi', server: 'Geliştirici Sunucusu', status: 'Success' },
            { date: new Date(Date.now() - 86400000), action: 'Bot Yeniden Başlatıldı', server: 'Sistem', status: 'Warning' }
        ];

        res.json(activities);
    });

    // API - Bot istatistikleri
    app.get('/api/stats', checkAuth, (req, res) => {
        const stats = {
            uptime: client.uptime,
            guildCount: client.guilds.cache.size,
            userCount: client.users.cache.size,
            channelCount: client.channels.cache.size,
            commandCount: client.commands.length,
            ping: client.ws.ping,
            memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
            botStartTime: dbManager.get("botAcilis_"),
            popularCommands: dbManager.getTopCommands(5)
        };

        res.json(stats);
    });

    // API - Özel bir sunucunun istatistikleri
    app.get('/api/guilds/:guildId/stats', checkPermission, (req, res) => {
        const guildId = req.params.guildId;
        const guild = client.guilds.cache.get(guildId);

        if (!guild) {
            return res.status(404).json({ error: 'Sunucu bulunamadı' });
        }

        // Sunucu ayarlarını al
        const settings = dbManager.getGuildSettings(guildId);

        // Liderlik tablosu
        const leaderboard = dbManager.getLevelLeaderboard(guildId, 5);

        const stats = {
            id: guild.id,
            name: guild.name,
            icon: guild.iconURL({ dynamic: true }),
            memberCount: guild.memberCount,
            botAddedAt: guild.joinedAt,
            settings,
            leaderboard
        };

        res.json(stats);
    });

    // API - Sunucu üyeleri
    app.get('/api/guilds/:guildId/members', checkPermission, (req, res) => {
        const guildId = req.params.guildId;
        const guild = client.guilds.cache.get(guildId);

        if (!guild) {
            return res.status(404).json({ error: 'Sunucu bulunamadı' });
        }

        // Üyeleri getir (maksimum 1000)
        const members = Array.from(guild.members.cache.values())
            .slice(0, 1000)
            .map(member => ({
                id: member.id,
                username: member.user.username,
                nickname: member.nickname,
                avatar: member.user.displayAvatarURL({ dynamic: true }),
                joinedAt: member.joinedAt,
                bot: member.user.bot,
                roles: Array.from(member.roles.cache.values())
                    .filter(role => role.name !== '@everyone')
                    .map(role => ({
                        id: role.id,
                        name: role.name,
                        color: role.hexColor
                    }))
            }));

        res.json(members);
    });

    // Hata sayfaları
    app.use((req, res, next) => {
        res.status(404).render('error', { error: 'Sayfa bulunamadı', user: req.user });
    });

    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).render('error', { error: 'Sunucu hatası', user: req.user });
    });

    // Yardımcı fonksiyonlar
    function getCommandCategory(commandName) {
        const moderasyonCommands = ['ban', 'kick', 'mute', 'unmute', 'timeout', 'untimeout', 'warn', 'sil'];
        const kayitCommands = ['kayıt', 'a-kayıt', 'a-kayıt-sistemi'];
        const kullaniciCommands = ['avatar', 'ping', 'afk', 'banner', 'kullanıcıbilgi', 'sunucubilgi'];
        const sistemCommands = ['level-sistemi', 'destek-sistemi', 'timeout-sistemi', 'öneri'];
        const korumaCommands = ['capslock-koruma', 'küfür-engel', 'reklam-engel', 'görsel-engel', 'hesap-koruma'];
        const muzikCommands = ['play', 'skip', 'queue', 'leave'];

        if (moderasyonCommands.includes(commandName)) return 'moderasyon';
        if (kayitCommands.includes(commandName)) return 'kayit';
        if (kullaniciCommands.includes(commandName)) return 'kullanici';
        if (sistemCommands.includes(commandName)) return 'sistemler';
        if (korumaCommands.includes(commandName)) return 'koruma';
        if (muzikCommands.includes(commandName)) return 'muzik';

        return 'diger';
    }

    // Server başlatma
    const PORT = process.env.PORT || config.panel.port || 3000;
    const server = app.listen(PORT, () => {
        console.log(`Yönetim paneli http://localhost:${PORT} adresinde çalışıyor`);
    });

    return server;
} 