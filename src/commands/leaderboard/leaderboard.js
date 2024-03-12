const { EmbedBuilder } = require("discord.js");
const { database, cooldown, util, config } = require("../../../utils/bot")
// Cooldowns
const { Collection } = require("discord.js");
const cooldowns = new Collection();

module.exports = {
    name: "leaderboard",
    description: "Show the leaderboard of users with the most money or bank",
    aliases: ["lb"],
    usage: ["wallet", "bank"],
    cooldown: 10,
    run: async (client, message, args, bot) => {
        if (bot.cooldown.has(client, message)) return;

        if (!args[0]) {
            return bot.util.tempMessage(message, 'You must specify options "wallet" or "bank"')
        }

        if (args[0] !== "wallet" && args[0] !== "bank") {
            return bot.util.tempMessage(message, 'Invalid option. Please choose either "wallet" or "bank".')
        }

        const data = await bot.database.getAll();

        // Cooldowns
        bot.cooldown.set(client, message);

        // WALLET LEADERBOARD
        if (args[0] === "wallet") {
            const dataWallet = await Object.values(data).sort(
                (a, b) => b.wallet - a.wallet
            );
            const leaderboard = [];

            for (let i = 0; i < dataWallet.length && i < 10; i++) {
                const user = await client.users.fetch(dataWallet[i].userID);
                leaderboard.push(
                    `\`${i + 1}.\` ${user?.tag ?? "Unknown User"} — **${
                        bot.config.currency
                    }${dataWallet[i].wallet.toLocaleString()}**`
                );
            }

            const embed = new EmbedBuilder()
                .setColor("Random")
                .setTitle("Global Wallet Leaderboard")
                .setDescription(leaderboard.join("\n"));

            message.channel.send({ embeds: [embed] });
        }

        // BANK LEADERBOARD
        if (args[0] === "bank") {
            const dataBank = await Object.values(data).sort(
                (a, b) => b.bank - a.bank
            );
            const leaderboard = [];

            for (let i = 0; i < dataBank.length && i < 10; i++) {
                const user = await client.users.fetch(dataBank[i].userID);
                leaderboard.push(
                    `\`${i + 1}.\` ${user?.tag ?? "Unknown User"} — **${
                        bot.config.currency
                    }${dataBank[i].bank.toLocaleString()}**`
                );
            }

            const embed = new EmbedBuilder()
                .setColor("Random")
                .setTitle("Global Bank Leaderboard")
                .setDescription(leaderboard.join("\n"));

            message.channel.send({ embeds: [embed] });
        }
    },
};
