const { EmbedBuilder } = require('discord.js');
const { database, cooldown, config, util } = require('../../../utils/bot');
// Cooldown
const { Collection } = require('discord.js');
const cooldowns = new Collection();

module.exports = {
    name: 'deposit',
    description: 'Deposit wallet to your bank account',
    aliases: ["dep"],
    usage: ['<amount>', 'all'],
    cooldown: 10,
    run: async (client, message, args) => { 
        // Cooldowns
	    if (cooldown.has(cooldowns, message)) return;
    
        const userID = message.author.id;
        const data = await database.get(userID);

        const wallet = data.wallet;
        const bank = data.bank;
    
        if (args == 'all') {
            if (wallet === 0) {
                return util.tempMessage(message, "You don't have money in your wallet to deposit.");
            }
    
            data.bank += wallet;
            data.wallet = 0;
    
            // Database
            await database.save(userID, data);

            const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle(`Deposit Successful (${config.currency}${wallet.toLocaleString()})`)
            .addFields({ name: `Wallet`, value: `${config.currency}${data.wallet.toLocaleString()}`})
            .addFields({ name: `Bank`, value: `${config.currency}${data.bank.toLocaleString()}`})
            .setFooter({text: `Requested by ${message.author.tag}`})
            .setTimestamp();

            message.channel.send({ embeds: [embed] });
            // Cooldowns
            return cooldown.set(cooldowns, message.author.id, module.exports.cooldown);
        }
        
        if (!args[0]) {
            return util.tempMessage(message, 'Please specify the amount of money to deposit');
        }
        const amount = parseInt(args[0]);
        if (args[0].includes('-') || args[0].includes('+') || args[0].includes(',') || args[0].includes('*') || args[0].includes('/') || args[0].includes('%') || args[0].includes('.')) {
            return util.tempMessage(message, 'Syntax error!!');
        }
        if (isNaN(amount)) {
            return util.tempMessage(message, "Invalid amount.");
        }
        if (amount > wallet) {
            return util.tempMessage(message, "You don't have enough money in your wallet to deposit that amount.");
        }
      
        data.wallet -= amount;
        data.bank += amount;

        await database.save(userID, data);

        const embed0 = new EmbedBuilder()
            .setColor('Green')
            .setTitle(`Deposit Successful (${config.currency}${amount.toLocaleString()})`)
            .addFields({ name: `Wallet`, value: `${config.currency}${data.wallet.toLocaleString()}`})
            .addFields({ name: `Bank`, value: `${config.currency}${data.bank.toLocaleString()}`})
            .setFooter({text: `Requested by ${message.author.tag}`})
            .setTimestamp();

        message.channel.send({ embeds: [embed0] });
        // Cooldowns
        return cooldown.set(cooldowns, message.author.id, module.exports.cooldown);
    }
};