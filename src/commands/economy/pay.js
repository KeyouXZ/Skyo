const {
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
} = require("discord.js");

module.exports = {
    name: "pay",
    description: "Transfer money to the specified person ",
    usage: ["<@user> <amount>"],
    cooldown: 20,
    run: async (client, message, args, bot) => {
        const userID = message.author.id;
        // Cooldowns
        if (bot.cooldown.has(client, message)) return;
        const data = await bot.database.get(bot.getAuth(userID))

        const target = message.mentions.members.first();
        if (!target) {
            return bot.util.tempMessage(message, "Please mention a user");
        }

        if (target.user.id == message.author.id) {
            return bot.util.tempMessage(
                message,
                "You can't give money to yourself"
            );
        }

        const targetData = await bot.database.get(bot.getAuth(target.user.id))
        if (!targetData) {
            return bot.util.tempMessage(message, target.user.username + " haven't account!")
        }

        const wallet = data.wallet;
        const tWallet = targetData.wallet;

        const amount = parseInt(args[1]);
        let feeAmount = 0.0146; // 1.46%
        if (data.isPremium === 1) feeAmount = 0; // 0%
        const fee = Math.floor(amount * feeAmount);
        const total = Math.floor(amount - fee);

        if (isNaN(amount)) {
            return bot.util.tempMessage(message, "Please specify a valid amount.");
        }
        if (
            args[1].includes("-") ||
            args[1].includes("+") ||
            args[1].includes(",") ||
            args[1].includes("*") ||
            args[1].includes("/") ||
            args[1].includes("%") ||
            args[1].includes(".")
        ) {
            return bot.util.tempMessage(message, "Syntax error!!");
        }
        if (amount > wallet) {
            return bot.util.tempMessage(
                message,
                "You don't have enough money in your wallet."
            );
        }

        const confirm = new ButtonBuilder()
            .setCustomId("confirm")
            .setLabel("Confirm")
            .setStyle(ButtonStyle.Success);

        const cancel = new ButtonBuilder()
            .setCustomId("cancel")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(confirm, cancel);

        let payMsg = null;

        const payEmbed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle(
                `${message.author.username}, you will give money to ${target.user.username}`
            )
            .setDescription(
                `To confirm press the **Confirm** button\nTo cancel press the **Cancel** button\n\nAmount: ${
                    bot.config.currency
                }${amount.toLocaleString()}\nFee: ${
                    bot.config.currency
                }${fee.toLocaleString()}\nReceived: ${
                    bot.config.currency
                }${total.toLocaleString()}\n\n**Status:** Waiting`
            )
            .setTimestamp();

        payMsg = await message.channel.send({
            embeds: [payEmbed],
            components: [row],
        });

        let isClicked = false;
        setTimeout(() => {
            if (isClicked == false) {
                confirm.setDisabled(true);
                cancel.setDisabled(true);
                payEmbed.setColor("Red");
                payEmbed.setDescription(
                    `To confirm press the **Confirm** button\nTo cancel press the **Cancel** button\n\nAmount: ${
                        bot.config.currency
                    }${amount.toLocaleString()}\nFee: ${
                        bot.config.currency
                    }${fee}\nReceived: ${
                        bot.config.currency
                    }${total.toLocaleString()}\n\n**Status:** Cancelled (Time Out)`
                );
                payMsg.edit({ embeds: [payEmbed], components: [row] });
            } else if (isClicked == true) return;
        }, 20000);

        const collector = payMsg.createMessageComponentCollector();

        // Cooldowns
        bot.cooldown.set(client, message);

        collector.on("collect", async (interaction) => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({
                    content: "You are not authorized to use this button.",
                    ephemeral: true,
                });
            }
            if (interaction.customId === "confirm") {
                isClicked = true;
                data.wallet -= amount;
                targetData.wallet += total;
                // Database
                await bot.database.save(bot.getAuth(userID), data);
                // Database
                await bot.database.save(bot.getAuth(target.user.id), targetData);
                try {
                    confirm.setDisabled(true);
                    cancel.setDisabled(true);
                    payEmbed.setColor("Green");
                    payEmbed.setDescription(
                        `To confirm press the **Confirm** button\nTo cancel press the **Cancel** button\n\nAmount: ${
                            bot.config.currency
                        }${amount.toLocaleString()}\nFee: ${
                            bot.config.currency
                        }${fee.toLocaleString()}\nReceived: ${
                            bot.config.currency
                        }${total.toLocaleString()}\n\n**Status:** Confirmed`
                    );
                    return interaction.update({
                        embeds: [payEmbed],
                        components: [row],
                    });
                } catch (err) {
                    return console.log(err);
                }
            } else if (interaction.customId === "cancel") {
                isClicked = true;
                confirm.setDisabled(true);
                cancel.setDisabled(true);
                payEmbed.setColor("Red");
                payEmbed.setDescription(
                    `To confirm press the **Confirm** button\nTo cancel press the **Cancel** button\n\nAmount: ${
                        bot.config.currency
                    }${amount.toLocaleString()}\nFee: ${
                        bot.config.currency
                    }${fee.toLocaleString()}\nReceived: ${
                        bot.config.currency
                    }${total.toLocaleString()}\n\n**Status:** Cancelled`
                );
                return interaction.update({
                    embeds: [payEmbed],
                    components: [row],
                });
            }
            collector.stop();
        });
    },
};
