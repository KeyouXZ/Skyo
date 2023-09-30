const { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder } = require("discord.js");
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

require("dotenv").config();
const fs = require("fs");
const config = require("../utils/config");
const chalk = require("chalk")

client.commands = new Collection();
client.aliases = new Collection();
client.slashCommands = new Collection();
client.buttons = new Collection();
client.prefix = config.prefix;

module.exports = client;

// Handler
fs.readdirSync("./src/handlers/").forEach((handler) => {
    require(`./handlers/${handler}`)(client);
});

// Enter bots
client.login(process.env.TOKEN);

// Terminal command

const { readline } = require("../utils/bot");
readline.create(client);

// Error log
if (process.env.WEBHOOK_URL) {
    const { WebhookClient } = require("discord.js");

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
        webhook.send(uR)
    })

    process.on('uncaughtException', (err, origin) => {
        const uE= new EmbedBuilder()
        .setTitle("Unhandled Rejection")
        .setColor('Red')
        .addFields([
            {
                name: '🚨 Error 🚨',
                value: `\`\`\`${err.stack}\`\`\``
            }
        ]);
        webhook.send(uE)
    })
}

const timestamp = new Date().toLocaleString('en-US', { hour12: false }).replace(',', '');
process.on("unhandledRejection", (reason, p) => {
    console.log(chalk.gray(`[${timestamp}]`), chalk.red.bold(`ERROR Unhandled Rejection: ${reason.stack}`));
});

process.on("uncaughtException", (err, origin) => {
    console.log(chalk.gray(`[${timestamp}]`), chalk.red.bold(`ERROR Uncaught Exception: ${err.stack}`));
});
