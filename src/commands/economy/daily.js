const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'daily',
    description: 'Claim your daily reward',
    cooldown: 10,
    run: async (client, message, args, bot) => {
        // Check cooldown
        if (bot.cooldown.has(client, message)) return;
        
        const auth = client.auth.get(message.author.id)
        
        const userId = message.author.id;
        const data = await bot.database.get(auth.name);

        const lastDaily = data.lastDaily || 0;
        const wallet = data.wallet;

        const now = Date.now();
        const timeDifference = now - lastDaily;
        const timeRemaining = (86400000 - timeDifference) / 1000;

        if (timeDifference < 86400000) {
            const hours = Math.floor(timeRemaining / 3600);
            const minutes = Math.floor((timeRemaining % 3600) / 60);
            const seconds = Math.floor(timeRemaining % 60);

            const alClaim = new EmbedBuilder()
            .setColor('Red')
            .setDescription(`⏱️ **|** You have to wait \`${hours}H ${minutes}M ${seconds}S.\``);
            message.reply({ embeds: [alClaim] });
            return bot.cooldown.set(client, message);
        } else {
            let dailyAmount = 310;
            let additionalAmount = 0;
            let messageContent = '';

            // Check if user has premium
            if (data.isPremium == 1) {
            // Generate random percentage increase between 7% and 10%
                const percentageIncrease = Math.random() * (0.10 - 0.07) + 0.07;
                additionalAmount = Math.ceil(dailyAmount * percentageIncrease);
            }

            data.wallet += dailyAmount + additionalAmount;
            data.lastDaily = now;
            // Update data
            await bot.database.save(auth.name, data)

            if (data.isPremium == 1) {
                messageContent = `You received ${bot.config.currency}${dailyAmount} + ${bot.config.currency}${additionalAmount} from your daily reward.`;
            } else {
                messageContent = `You get ${bot.config.currency}${dailyAmount.toLocaleString()} from daily reward.`;
            }

            const claimEmbed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(messageContent);
            message.reply({ embeds: [claimEmbed] });
            return bot.cooldown.set(client, message)
        }
    },
};
