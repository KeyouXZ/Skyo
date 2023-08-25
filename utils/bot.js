const chalk = require("chalk");
const mongoose = require("mongoose");
const userSchema = require("../database/usersSchema");
const globalSchema = require("../database/globalsSchema");
const timestamp = new Date().toLocaleString("en-US", { hour12: false }).replace(",", "");

const database = {
    createUsers: async function(userId) {
        const user = new userSchema({ userId });
        await user.save();
        return console.log(`New user ${userId} created`);
    },
    get: async function(userId) {
        return await userSchema.findOne({ userId });
    },
    getAll: async function() {
        return await userSchema.find(); 
    },
    save: async function(userId, update) {
        await userSchema.updateOne({ userId }, update);
    },
    /*delete: async function(userId) {
        await userSchema.deleteOne({ userId });
    }*/
    getGlobalAll: async function() {
        return await globalSchema.find(); 
    },
};

const cooldown = {
    set: async function (cooldowns, userId, cooldownSeconds) {
        const data = await database.get(userId);
        let cooldownAmount = cooldownSeconds * 1000;
        if (data.isPremium == 1) {
        cooldownAmount -= cooldownAmount * 0.35;
        }
            cooldowns.set(userId, Date.now() + cooldownAmount);
        },
    has: function (cooldowns, userId, message) {
        const expirationTime = cooldowns.get(userId) || 0;
        if (Date.now() < expirationTime) {
            const timeLeft = (expirationTime - Date.now()) / 1000;
            return message.channel.send(`**⏱ | <@${userId}>**! Please wait and try the command again **in ${timeLeft.toFixed()} seconds**`)
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
        const chalk = require("chalk");

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

        rl.on("line", (input) => {
            if (input !== "help" && input !== "user" && input !== "guild" && input !== "system" && input !== "reload" && input !== "exit") {
                console.log(chalk.red.bold(`Invalid command ${input}. Type help for all commands!`));
            }
            if (input == "help") {
                console.log(chalk.yellow(`Commands\nhelp, user, guild, system, reload, exit`));
            }
            if (input == "user") {
                console.log(`Users count:`,chalk.yellow.bold(client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)));
            }
            if (input == "guild") {
                console.log(`Guilds count:`, chalk.yellow.bold(client.guilds.cache.size));
            }
            if (input == "system") {
                console.log("Node:", chalk.yellow(process.version), "\nDevice:", chalk.yellow(process.platform, process.arch), "\nMemory:", chalk.yellow((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)), "MB\nRSS:", chalk.yellow((process.memoryUsage().rss / 1024 / 1024).toFixed(2)), `MB`);
            }
            if (input === "reload") {
                client.destroy();
                client.login(process.env.TOKEN);
                console.log("Client reloaded!");
            }
            if (input === "exit") {
                console.log("Received exit command, Shutting Down...");
                rl.close();
                client.destroy();
                process.exit(1);
            }
            if (input === "test") {
                const msg = "Client executed:";
                console.log(chalk.hex("#CD00CD")(`${msg} exit.`));
                console.log(chalk.blue.bgRed.bold("Hello world!"));
            }
        });
    },
};

module.exports = {
    cooldown,
    database,
    readline
};
