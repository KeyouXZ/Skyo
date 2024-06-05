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
        const data = await bot.database.get(bot.getAuth(message.author.id));
        const itemData = await bot.database.getItemAll();

        const userId = message.author.id;
        const user = data;
        const item = itemData.find((item) => item.id === args[0]);

        if (!args[0]) {
            return bot.util.tempMessage(message, `Please specify item id to use`);
        }

        if (!item) {
            return bot.util.tempMessage(message, "Invalid item ID");
        }

        if (!data.item[args[0]] || data.item[args[0]] < 1) {
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
            user.item = data.item[args[0]] - 1;
            await bot.database.save(bot.getAuth(message.author.id), user);

            return message.channel.send(
                `${bot.getAuth(message.author.id).username}! Premium has been set for ${
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
