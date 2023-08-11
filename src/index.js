const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
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
const config = require("./utils/config");

client.commands = new Collection();
client.aliases = new Collection();
client.slashCommands = new Collection();
client.buttons = new Collection();
client.prefix = config.prefix;

module.exports = client;

// Handler
fs.readdirSync("./src/handlers/").forEach((handler) => {
    require(`./src/handlers/${handler}`)(client);
});

// Enter bots
client.login(process.env.TOKEN);

// Terminal command

const { readline } = require("./utils/bot");
readline.create(client);

// Error log
const { WebhookClient } = require("discord.js");

const webhook = new WebhookClient({
    url: process.env.WEBHOOK_URL,
});

process.on("unhandledRejection", (reason, p) => {
    console.log(`[Main/ERROR]: Unhandled Rejection/Catch`);
    console.log(reason, p);
    webhook.send(`[Main/ERROR]: Unhandled Rejection/Catch\n${reason}\n${p}`);
});

process.on("uncaughtException", (err, origin) => {
    console.log(`[Main/ERROR]: Uncaught Exception/Catch`);
    console.log(err, origin);
    webhook.send(`[Main/ERROR]: Uncaught Exception/Catch\n${err}\n${origin}`);
});
