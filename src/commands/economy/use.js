const moment = require("moment");

module.exports = {
    name: "use",
    description: "Use an item",
    cooldown: 10,
    usage: ["<itemID> [amount]", "<itemID> all"],
    run: async (client, message, args, bot) => {
        // Cooldowns
        if (bot.cooldown.has(client, message)) return;
        
        // Read database
        const data = await bot.database.get(message.author.id);
        const itemData = await bot.database.getItemAll();
        const userItem = await bot.database.getUserItem(message.author.id);

        const userId = message.author.id;
        const user = data;
        const item = itemData.find((item) => item.id === args[0]);

        if (!args[0]) {
            return bot.util.tempMessage(message, `Please specify item id to use`);
        }

        if (!item) {
            return bot.util.tempMessage(message, "Invalid item ID");
        }

        if (!userItem.item[args[0]] || userItem.item[args[0]] < 1) {
            return bot.util.tempMessage(message, `You don't have this item`);
        }

        if (item.type !== 1) {
            return bot.util.tempMessage(message, "This item cannot be used");
        }

        // Cooldowns
        bot.cooldown.set(client, message);

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
            await bot.database.save(message.author.id, user);
            await bot.database.saveUserItem(message.author.id, newItem);

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
