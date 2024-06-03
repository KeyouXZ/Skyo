const { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder, WebhookClient } = require("discord.js");
const client = new Client({
    restRequestTimeout: 60000,
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.MessageContent,
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
        Partials.Reaction,
        Partials.GuildScheduledEvents,
    ],
});

const fs = require("fs");
const { readline, config, logger } = require("../utils/bot");
require("dotenv").config()

client.commands = new Collection();
client.aliases = new Collection();
client.slashCommands = new Collection();
client.buttons = new Collection();
client.prefix = config.prefix;
client.cooldowns = new Collection();
client.auth = new Collection();

module.exports = client;

// Handler
require(`./handlers/index.js`)(client);

// Enter bots
client.login(process.env.TOKEN);

// Terminal command
readline.create(client);

// Error log
if (process.env.WEBHOOK_URL) {
    const webhook = new WebhookClient({
        url: process.env.WEBHOOK_URL,
    });
    
    process.on("unhandledRejection", (reason, p) => {
        const uR = new EmbedBuilder()
        .setTitle("Unhandled Rejection")
        .setColor('Red')
        .addFields([
            {
                name: '🚨 Error 🚨',
                value: `\`\`\`${reason.stack}\`\`\``
            }
        ]);
        webhook.send({username: "Skyo Logger", embeds: [uR]})
    })

    process.on('uncaughtException', (err, origin) => {
        const uE = new EmbedBuilder()
        .setTitle("Unhandled Rejection")
        .setColor('Red')
        .addFields([
            {
                name: '🚨 Error 🚨',
                value: `\`\`\`${err.stack}\`\`\``
            }
        ]);
        webhook.send({ username: "Skyo Logger", embeds: [uE]})
    })
}

process.on("unhandledRejection", (reason, p) => {
    logger.error("Unhandled Rejection:", reason.stack)
});

process.on("uncaughtException", (err, origin) => {
    logger.error("Uncaught Exception:", err.stack)
});
