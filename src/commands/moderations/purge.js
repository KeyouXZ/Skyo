const { EmbedBuilder } = require("discord.js");
const { database, cooldown, config, util } = require("../../../utils/bot")
// Cooldowns
const { Collection } = require("discord.js");
const cooldowns = new Collection();

module.exports = {
    name: "purge",
    description: "Deletes a specified number of messages.",
    usage: ["<amount>"],
    cooldown: 10,
    userPerms: ["ManageMessages"],
    run: async (client, message, args) => {
        if (cooldown.has(cooldowns, message)) return

        const amount = parseInt(args[0]) + 1;

        if (isNaN(amount)) {
            return util.tempMessage(message, `That doesn\'t seem to be a valid number`)
        } else if (amount <= 1 || amount > 100) {
            return util.tempMessage(message, `You need to input a number between 1 and 99`)
        }

        const messages = await message.channel.messages.fetch({
            limit: amount,
        });
        message.channel
            .bulkDelete(messages, true)
            .then((deletedMessages) => {
                const numDeleted = deletedMessages.size - 1;
                const Embed = new EmbedBuilder()
                    .setColor(`Green`)
                    .setDescription(`Deleted ${numDeleted} messages`);
                // Cooldowns
                cooldown.set(cooldowns, message.author.id);
                message.channel.send({ embeds: [Embed] }).then((msg) => {
                    setTimeout(() => {
                        msg.delete();
                    }, 10000);
                });
            })
            .catch((err) => {
                console.error(err);
                const errEmbed = new EmbedBuilder()
                    .setColor("Red")
                    .setDescription(
                        `There was an error trying to prune messages in this channel!`
                    );
                message.channel.send({ embeds: [errEmbed] }).then((msg) => {
                    setTimeout(() => {
                        msg.delete();
                    }, 10000);
                });
            });
    },
};
