const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "withdraw",
    description: "Withdraw bank to your wallet",
    aliases: ["wd"],
    usage: ["<amount>", "all"],
    cooldown: 10,
    run: async (client, message, args, bot) => {
        // Cooldowns
        if (bot.cooldown.has(client, message)) return;

        const userID = message.author.id;
        const data = await bot.database.get(userID);

        const bank = data.bank;
        const wallet = data.wallet;

        if (args == "all") {
            if (bank === 0) {
                return bot.util.tempMessage(
                    message, "You don't have money in your bank to withdraw."
                );
            }
            data.wallet += bank;
            data.bank = 0;

            await bot.database.save(userID, data)

            const embed = new EmbedBuilder()
                .setColor("Green")
                .setTitle(
                    `Withdraw Successful (${
                        bot.config.currency
                    }${bank.toLocaleString()})`
                )
                .addFields({
                    name: `Wallet`,
                    value: `${bot.config.currency}${data.wallet.toLocaleString()}`,
                })
                .addFields({
                    name: `Bank`,
                    value: `${bot.config.currency}${data.bank.toLocaleString()}`,
                })
                .setFooter({ text: `Requested by ${message.author.tag}` })
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
            // Cooldowns
            return bot.cooldown.set(
                client,
                message
            );
        }

        if (!args[0]) {
            return bot.util.tempMessage(
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
            return bot.util.tempMessage(message, "Syntax error!!");
        }
        if (isNaN(amount)) {
            return bot.util.tempMessage(message, "Invalid amount.");
        }
        if (amount > bank) {
            return bot.util.tempMessage(
                message, "You don't have enough money in your bank to withdraw that amount."
            );
        }

        data.bank -= amount;
        data.wallet += amount;

        await bot.database.save(userID, data)

        const embed0 = new EmbedBuilder()
            .setColor("Green")
            .setTitle(
                `Withdraw Successful (${
                    bot.config.currency
                }${amount.toLocaleString()})`
            )
            .addFields({
                name: `Wallet`,
                value: `${bot.config.currency}${data.wallet.toLocaleString()}`,
            })
            .addFields({
                name: `Bank`,
                value: `${bot.config.currency}${data.bank.toLocaleString()}`,
            })
            .setFooter({ text: `Requested by ${message.author.tag}` })
            .setTimestamp();

        message.channel.send({ embeds: [embed0] });
        // Cooldowns
        return bot.cooldown.set(
            client,
            message
        );
    },
};
