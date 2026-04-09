const db = require("croxydb");
const config = require("../config.json");

module.exports = {
  name: "messageCreate",
  run: async (client, message) => {
    if (message.author.bot) return;

    const prefix = config.prefix;
    if (!message.content.startsWith(prefix)) return;

    const commandName = message.content.slice(prefix.length).trim().split(/ +/).shift().toLowerCase();
    const commandText = db.fetch(`custom_command_${message.guild.id}_${commandName}`);

    if (commandText) {
      message.channel.send(commandText).catch(() => {});
    }
  }
};
