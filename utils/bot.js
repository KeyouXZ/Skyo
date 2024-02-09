require("dotenv").config();
const chalk = require("chalk");
const { WebhookClient, EmbedBuilder } = require("discord.js")
const userSchema = require("../database/userSchema");
const itemSchema = require("../database/itemSchema");
const serverSchema = require("../database/serverSchema")
const userItemSchema = require("../database/userItemSchema.js")
const timestamp = new Date().toLocaleString("en-US", { hour12: false }).replace(",", "");

const database = {
    createUser: async function(message, target) {
        if (target?.user.bot ) return;
        let userX;
        if (message && !target) userX = message.author;
        if (target) userX = target.user;
        const user = new userSchema({ userID: userX.id });
        await user.save();
        if (process.env.WEBHOOK_URL) {
            const webhook = new WebhookClient({
                url: process.env.WEBHOOK_URL,
            });
            
            const newUserEmbed = new EmbedBuilder()
            .setTitle("New User")
            .setColor("Random")
            .addFields(
                {
                    name: "User Information",
                    value: `Username: ${await userX.username}\nID: ${await userX.id}\nTime: ${timestamp}`
                }
            );
            
            webhook.send({ username: "Skyo Logger", embeds: [newUserEmbed]});
        }
        return console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `User with ID ${userX.username} has been created`);
    },
    get: async function(userID) {
        return await userSchema.findOne({ userID });
    },
    getAll: async function() {
        return await userSchema.find(); 
    },
    save: async function(userID, update) {
        return await userSchema.updateOne({ userID }, update);
    },
    createServer: async function(message) {
        const server = new serverSchema({ serverID: message.guild.id });
        await server.save();
        if (process.env.WEBHOOK_URL) {
            const webhook = new WebhookClient({
                url: process.env.WEBHOOK_URL,
            });
            
            const newServerEmbed = new EmbedBuilder()
            .setTitle("New Server")
            .setColor("Random")
            .addFields(
                {
                    name: "Server Information",
                    value: `Name: ${message.guild.name}\nID: ${message.guild.id}\nTime: ${timestamp}`
                }
            )
            
            webhook.send({ username: "Skyo Logger", embeds: [newServerEmbed]})
        }
        return console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `Server with ID ${message.guild.id} has been created`);
    },
    getItem: async function(id) {
        return await itemSchema.findOne({ id });
    },
    getItemAll: async function() {
        return await itemSchema.find(); 
    },
    getServer: async function(serverID) {
        return await serverSchema.findOne({ serverID });
    },
    getServerAll: async function() {
        return await serverSchema.find();
    },
    saveServer: async function(serverID, update) {
        return await serverSchema.updateOne({ serverID }, update)
    },
    getUserItem: async function(userID) {
        return await userItemSchema.findOne({ userID})
    },
    saveUserItem: async function(userID, update) {
        return await userItemSchema.updateOne({ userID }, update)
    }
};

const cooldown = {
    /**
     * 
     * @param {collection} cooldowns Cooldown collection from discord.js
     * @param {number} userID 
     * @param {number} cooldownTime 
     */
    set: async function (cooldowns, userID, cooldownTime) {
        const data = await database.get(userID);
        let cooldownAmount = cooldownTime * 1000;
        if (data.isPremium == 1) {
        cooldownAmount -= cooldownAmount * 0.35;
        }
            cooldowns.set(userID, Date.now() + cooldownAmount);
        },
    has: function (cooldowns, message) {
        const expirationTime = cooldowns.get(message.author.id) || 0;
        if (Date.now() < expirationTime) {
            const timeLeft = (expirationTime - Date.now()) / 1000;
            return message.channel.send(`**⏱ | <@${message.author.id}>**! Please wait and try the command again **in ${timeLeft.toFixed()} seconds**`)
            .then((msg) => {
                setTimeout(() => {
                    msg.delete();
                }, timeLeft.toFixed() * 1000);
            });
        }
    },
};

const readline = {
    create: function (client) {
        const readline = require("readline");
        
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: ": ",
        });

        let sigintCount = 0;

        rl.on("SIGINT", () => {
            sigintCount++;
            if (sigintCount === 1) {
                console.log("Are you sure you want to exit? Press CTRL-C again to confirm.");
                setTimeout(() => {
                    sigintCount = 0;
                }, 3000);
            } else {
                console.log("Exiting...");
                rl.close();
                client.destroy();
                process.exit(1);
            }
        });

        rl.on("line", async (input) => {
            switch (input) {
                case "help":
                    console.log(chalk.yellow(`Commands\nhelp, user, guild, system, clear, exit`));
                    break
                    
                case "user":
                    console.log(`Users count:`,chalk.yellow.bold(client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)));
                    break
                    
                case "guild":
                    console.log(`Guilds count:`, chalk.yellow.bold(client.guilds.cache.size));
                    break
                    
                case "system":
                    console.log("Node:", chalk.yellow(process.version), "\nDevice:", chalk.yellow(process.platform, process.arch), "\nMemory:", chalk.yellow((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)), "MB\nRSS:", chalk.yellow((process.memoryUsage().rss / 1024 / 1024).toFixed(2)), `MB`);
                    break
                    
                case "clear":
                    console.clear()
                    break
                
                case "exit":
                    console.log("Received exit command, Shutting Down...");
                    rl.close();
                    client.destroy();
                    process.exit(1);
                    break
                    
                default:
                    console.log(chalk.red.bold(`Invalid command ${input}. Type help for all commands!`));
                    break
            }
        });
    },
};

const util = {
    /**
     * 
     * @param {*} m Message variable from discord.js
     * @param {string} message New message "Send Me"
     * @param {number} timeout New timeout in second
     */
    tempMessage: function(m, message, timeout) {
        const time = timeout * 1000 || 15000
        m.reply(message).then(msg => {
            setTimeout(() => {
                msg.delete();
            }, time);
        });
    }
}

const config = {
    env: function (c) {
        return process.env[c]
    },
	set: function (c) {
		return this.prefix.push(`<@${c.user.id}>`)
	},
    "prefix": [`${process.env.PREFIX}`, "V!"],
    "developer": ["837630150954713099"],
    "currency": "Kc."
}

module.exports = {
    cooldown,
    database,
    readline,
    config,
    util
};