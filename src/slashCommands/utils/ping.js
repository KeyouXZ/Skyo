const { ApplicationCommandType } = require("discord.js");

module.exports = {
    name: "ping",
    description: "Check bot ping",
    type: ApplicationCommandType.ChatInput,
    cooldown: 10,
    run: async (client, interaction) => {
        interaction.reply(`Pong! Latency **${Math.round(client.ws.ping)}**`)
    }
}