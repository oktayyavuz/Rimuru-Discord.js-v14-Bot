const Discord = require("discord.js");
const { EmbedBuilder } = require("discord.js")
const fs = require("fs");
const dbManager = require('./helpers/database');
const config = require("./config.json");
const functions = require('./function/functions');
const Rest = require("@discordjs/rest");
const DiscordApi = require("discord-api-types/v10");

const client = new Discord.Client({
	intents: 3276543,
	partials: Object.values(Discord.Partials),
	allowedMentions: {
		parse: ["users", "roles", "everyone"]
	},
	retryLimit: 3
});

client.setMaxListeners(30);


process.on('unhandledRejection', (reason, promise) => {
	console.error('[x] Yakalanmayan Red (Unhandled Rejection):', reason);
});

process.on('uncaughtException', (err, origin) => {
	console.error('[x] Yakalanmayan İstisna (Uncaught Exception):', err);
});


global.client = client;
client.commands = (global.commands = []);
client.config = config;
client.db = dbManager;

// Komutları yükle
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
console.log(`[-] ${commandFiles.length} komut algılandı.`)

for (let commandName of commandFiles) {
	const command = require(`./commands/${commandName}`);
	client.commands.push({
		name: command.name.toLowerCase(),
		description: command.description.toLowerCase(),
		options: command.options,
		dm_permission: false,
		type: 1
	});

	console.log(`[+] ${commandName} komutu başarıyla yüklendi.`)
}


const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith(".js"));
console.log(`[-] ${eventFiles.length} olay algılandı.`);

const eventHandlers = new Map();

for (let file of eventFiles) {
	const event = require(`./events/${file}`);
	const name = event.name || file.split(".")[0];

	if (!eventHandlers.has(name)) {
		eventHandlers.set(name, []);
	}
	eventHandlers.get(name).push(event);
}

for (const [name, handlers] of eventHandlers) {
	const isOnce = handlers.some(h => h.once);

	if (isOnce) {
		client.once(name, (...args) => {
			handlers.forEach(h => h.run(client, ...args));
		});
	} else {
		client.on(name, (...args) => {
			handlers.forEach(h => h.run(client, ...args));
		});
	}
	console.log(`[+] ${name} olayı için ${handlers.length} işleyici yüklendi.`);
}



client.login(config.token).then(() => {
	console.log(`[-] Discord API'ye istek gönderiliyor.`);
}).catch((err) => {
	console.log(`[x] Discord API'ye istek gönderimi başarısız: ${err.message}`);
});

// Client'ı dışa aktar (dashboard için)
module.exports = { client };

