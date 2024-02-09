const moment = require("moment");
const { database, cooldown, config, util } = require("../../../utils/bot");
// Cooldown
const { Collection } = require("discord.js");
const cooldowns = new Collection();

module.exports = {
    name: "use",
    description: "Use an item",
    cooldown: 10,
    usage: ["<itemID> [amount]", "<itemID> all"],
    run: async (client, message, args) => {
        // Read database
        const data = await database.get(message.author.id);
        const itemData = await database.getItemAll();
        const userItem = await database.getUserItem(message.author.id);

        // Cooldowns
        // Cooldowns
        if (cooldown.has(cooldowns, message)) return;

        const userId = message.author.id;
        const user = data;
        const item = itemData.find((item) => item.id === args[0]);

        if (!args[0]) {
            return util.deleteMessage(message, `Please specify item id to use`);
        }

        if (!item) {
            return util.deleteMessage(message, "Invalid item ID");
        }

        if (!userItem.item[args[0]] || userItem.item[args[0]] < 1) {
            return util.deleteMessage(message, `You don't have this item`);
        }

        if (item.type !== 1) {
            return util.deleteMessage(message, "This item cannot be used");
        }

        // Cooldowns
        cooldown.set(cooldowns, message.author.id, module.exports.cooldown);

        // Premium items
        // Map item ID to premium duration
        const premiumDurations = {
            1: 30,
            2: 60,
            3: 90,
            4: 365,
        };

        if (premiumDurations[args[0]]) {
            if (user.isPremium === 1) {
                return message.reply(`You already have an active premium`);
            }

            user.isPremium = 1;
            user.premiumDate = moment().toISOString();
            user.premiumDuration = premiumDurations[args[0]];
            const newItem = userItem.item[args[0]] - 1;
            await database.save(message.author.id, user);
            await database.saveUserItem(message.author.id, newItem);

            return message.channel.send(
                `${message.author.username}! Premium has been set for ${
                    premiumDurations[args[0]]
                } days to your account!`
            );
        }

        if (item == 5) {
            message.reply("Hello");
        }

        //
    },
};
