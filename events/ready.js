const { ActivityType, REST, Routes } = require('discord.js');
const config = require("../config.json");
const dbManager = require('../helpers/database');

module.exports = {
    name: 'ready',
    once: true,
    run: async (client) => {
        const rest = new REST({ version: "10" }).setToken(config.token);
        try {
            await rest.put(Routes.applicationCommands(client.user.id), {
                body: client.commands,
            });

            console.clear();
            console.log(`${client.user.tag} Aktif! 💕`);
            dbManager.set("botAcilis_", Date.now());

            // Bot durumunu ayarla
            const status = dbManager.get('globalStatus') || config.durum;
            client.user.setPresence({
                activities: [{ name: `${status}`, type: ActivityType.Watching }],
                status: 'idle',
            });

            // Web kontrol panelini başlat
            if (config.panel) {
                try {
                    const dashboardServer = require('../dashboard/server')(client);
                    const port = config.panel.port || 3000;
                    dashboardServer.listen(port, () => {
                        console.log(`[+] Web kontrol paneli http://localhost:${port} adresinde başlatıldı.`);
                    });
                } catch (error) {
                    console.error('[x] Web kontrol paneli başlatılamadı:', error);
                }
            }

        } catch (error) {
            console.error('[x] Bot başlatılırken hata oluştu:', error);
        }
    }
};
