require("dotenv").config();
const chalk = require("chalk");
const { WebhookClient, EmbedBuilder } = require("discord.js")
const { userSchema } = require("../database/user");
const itemSchema = require("../database/itemSchema");
const serverSchema = require("../database/serverSchema")
const userItemSchema = require("../database/userItemSchema.js")
const timestamp = new Date().toLocaleString("en-US", { hour12: false }).replace(",", "");

const database = {
    get: async function(name) {
        return await userSchema.findOne({ name });
    },
    getAll: async function() {
        return await userSchema.find(); 
    },
    save: async function(name, update) {
        return await userSchema.updateOne({ name }, update);
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
     * @param {client} client Cooldown collection from discord.js
     * @param {message} message 
     */
    set: async function (client, message) {
        /**
         * Cooldown map
         * Primary: author id
         * Secondary: command name and time
        */
        
        // Get command name
        const prefix = client.prefix[0];
        const command = message.content.slice(prefix.length).trim().split(/ +/g).shift().toLowerCase();
        
        const data = await database.get(client.auth.get(message.author.id)?.name);
        let commandCooldown = client.commands.get(command)?.cooldown || client.commands.get(client.aliases.get(command))?.cooldown || 15;
        
        let cooldownAmount = commandCooldown * 1000 || 15 * 1000;
        
        // Check if user is premium or not and set cooldown
        if (data?.isPremium == 1) {
            cooldownAmount -= cooldownAmount * 0.35;
        }
        
        // Cooldown map
        const cooldownMap = {
            command: client.commands.get(command)?.name || client.commands.get(client.aliases.get(command)).name,
            time: Date.now() + cooldownAmount
        }
        client.cooldowns.set(message.author.id, cooldownMap);
    },
    has: function (client, message) {
       // Get command name
        const prefix = client.prefix[0];
        let command = message.content.slice(prefix.length).trim().split(/ +/g).shift().toLowerCase();
        command = client.aliases.get(command) || command
        
        // Get cooldowns from client
        const expirationTime = client.cooldowns.get(message.author.id)?.time || 0;
        
        if (command == client.cooldowns.get(message.author.id)?.command && Date.now() < expirationTime) {
            const timeLeft = (expirationTime - Date.now()) / 1000;
            message.channel.send(`**⏱ | <@${message.author.id}>**! Please wait and try the command again **in ${timeLeft.toFixed()} seconds**`)
            .then((msg) => {
                setTimeout(() => {
                    msg.delete();
                }, timeLeft.toFixed() * 1000);
            });
            return true
        } else {
            return false
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
                    
                case "restart":
                    console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `Restarting bot...`);
                    require("../src/index")
                    break
                
                case "exit":
                    console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `Shutting down...`);
                    rl.close();
                    client.destroy();
                    process.exit(0);
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
        const time = timeout * 1000 || 3000 * 1000
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
    "currency": "Sc."
}

module.exports = {
    cooldown,
    database,
    readline,
    config,
    util
};