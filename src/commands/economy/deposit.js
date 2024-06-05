const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'deposit',
    description: 'Deposit wallet to your bank account',
    aliases: ["dep"],
    usage: ['<amount>', 'all'],
    cooldown: 10,
    run: async (client, message, args, bot) => { 
        // Cooldowns
	    if (bot.cooldown.has(client, message)) return;
    
        const userID = message.author.id;
        const data = await bot.database.get(client.auth.get(userID).name)

        const wallet = data.wallet;
        const bank = data.bank;
    
        if (args == 'all') {
            if (wallet === 0) {
                return bot.util.tempMessage(message, "You don't have money in your wallet to deposit.");
            }
    
            data.bank += wallet;
            data.wallet = 0;
    
            // Database
            await bot.database.save(bot.getAuth(userID), data);

            const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle(`Deposit Successful (${bot.config.currency}${wallet.toLocaleString()})`)
            .addFields({ name: `Wallet`, value: `${bot.config.currency}${data.wallet.toLocaleString()}`})
            .addFields({ name: `Bank`, value: `${bot.config.currency}${data.bank.toLocaleString()}`})
            .setFooter({text: `Requested by ${message.author.tag}`})
            .setTimestamp();

            message.channel.send({ embeds: [embed] });
            // Cooldowns
            return bot.cooldown.set(client, message);
        }
        
        if (!args[0]) {
            return bot.util.tempMessage(message, 'Please specify the amount of money to deposit');
        }
        const amount = parseInt(args[0]);
        if (args[0].includes('-') || args[0].includes('+') || args[0].includes(',') || args[0].includes('*') || args[0].includes('/') || args[0].includes('%') || args[0].includes('.')) {
            return bot.util.tempMessage(message, 'Syntax error!!');
        }
        if (isNaN(amount)) {
            return bot.util.tempMessage(message, "Invalid amount.");
        }
        if (amount > wallet) {
            return bot.util.tempMessage(message, "You don't have enough money in your wallet to deposit that amount.");
        }
      
        data.wallet -= amount;
        data.bank += amount;

        await bot.database.save(bot.getAuth(userID), data);

        const embed0 = new EmbedBuilder()
            .setColor('Green')
            .setTitle(`Deposit Successful (${bot.config.currency}${amount.toLocaleString()})`)
            .addFields({ name: `Wallet`, value: `${bot.config.currency}${data.wallet.toLocaleString()}`})
            .addFields({ name: `Bank`, value: `${bot.config.currency}${data.bank.toLocaleString()}`})
            .setFooter({text: `Requested by ${message.author.tag}`})
            .setTimestamp();

        message.channel.send({ embeds: [embed0] });
        // Cooldowns
        return bot.cooldown.set(client, message);
    }
};