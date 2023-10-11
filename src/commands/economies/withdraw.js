const { EmbedBuilder } = require("discord.js");
const { database, cooldown, util, config } = require("../../../utils/bot");
// Cooldown
const { Collection } = require("discord.js");
const cooldowns = new Collection();

module.exports = {
    name: "withdraw",
    description: "Withdraw bank to your wallet",
    aliases: ["wd"],
    usage: ["<amount>", "all"],
    cooldown: 10,
    run: async (client, message, args) => {
        // Cooldowns
        if (cooldown.has(cooldowns, message)) return;

        const userID = message.author.id;
        const data = await database.get(userID);

        const bank = data.bank;
        const wallet = data.wallet;

        if (args == "all") {
            if (bank === 0) {
                return util.tempMessage(
                    message, "You don't have money in your bank to withdraw."
                );
            }
            data.wallet += bank;
            data.bank = 0;

            await database.save(userID, data)

            const embed = new EmbedBuilder()
                .setColor("Green")
                .setTitle(
                    `Withdraw Successful (${
                        config.currency
                    }${bank.toLocaleString()})`
                )
                .addFields({
                    name: `Wallet`,
                    value: `${config.currency}${data.wallet.toLocaleString()}`,
                })
                .addFields({
                    name: `Bank`,
                    value: `${config.currency}${data.bank.toLocaleString()}`,
                })
                .setFooter({ text: `Requested by ${message.author.tag}` })
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
            // Cooldowns
            return cooldown.set(
                cooldowns,
                message.author.id,
                module.exports.cooldown
            );
        }

        if (!args[0]) {
            return util.tempMessage(
                message, "Please specified the amount of money to withdraw"
            );
        }

        const amount = parseInt(args[0]);
        if (
            args[0].includes("-") ||
            args[0].includes("+") ||
            args[0].includes(",") ||
            args[0].includes("*") ||
            args[0].includes("/") ||
            args[0].includes("%") ||
            args[0].includes(".")
        ) {
            return util.tempMessage(message, "Syntax error!!");
        }
        if (isNaN(amount)) {
            return util.tempMessage(message, "Invalid amount.");
        }
        if (amount > bank) {
            return util.tempMessage(
                message, "You don't have enough money in your bank to withdraw that amount."
            );
        }

        data.bank -= amount;
        data.wallet += amount;

        await database.run(userID, data)

        const embed0 = new EmbedBuilder()
            .setColor("Green")
            .setTitle(
                `Withdraw Successful (${
                    config.currency
                }${amount.toLocaleString()})`
            )
            .addFields({
                name: `Wallet`,
                value: `${config.currency}${data.wallet.toLocaleString()}`,
            })
            .addFields({
                name: `Bank`,
                value: `${config.currency}${data.bank.toLocaleString()}`,
            })
            .setFooter({ text: `Requested by ${message.author.tag}` })
            .setTimestamp();

        message.channel.send({ embeds: [embed0] });
        // Cooldowns
        return cooldown.set(
            cooldowns,
            message.author.id,
            module.exports.cooldown
        );
    },
};
