const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'balance',
    description: 'Check user balance',
    aliases: ["bal"],
    usage: ['[@user]'],
    cooldown: 10,
    run: async (client, message, args, bot) => {
        // Check cooldown
        if (bot.cooldown.has(client, message)) return;
        
        const member = message.mentions.members.first();
        const authorId = message.author.id;
        const authorTag = message.author.tag;
        
        if (member && !member.user.bot) {
            const userId = member.user.id;
            const userName = member.user.username;
            const userTag = member.user.tag;
      
            const data = await bot.database.get(client.auth.get(userId)?.name);
            
            if (!data) {
                return message.reply(`${userName} doesn't have an account`)
            }
      
            const wallet = data.wallet;
            const bank = data.bank;
            const total = wallet + bank;
      
            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle(`${userName}'s Balance`)
                .addFields({ name: `Wallet`, value: `${bot.config.currency}${wallet.toLocaleString()}`})
                .addFields({ name: `Bank`, value: `${bot.config.currency}${bank.toLocaleString()}`})
                .addFields({ name: 'Total', value: `${bot.config.currency}${total.toLocaleString()}`})
                .setFooter({ text: `Requested by ${userTag}` })
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } else if (!member) {
            const data = await bot.database.get(client.auth.get(message.author.id).name);

            const aWallet = data.wallet;
            const aBank = data.bank;
            const aTotal = aWallet + aBank;

            const aEmbed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle(`${message.author.username}'s Balance`)
            .addFields({ name: `Wallet`, value: `${bot.config.currency}${aWallet.toLocaleString()}` })
            .addFields({ name: `Bank`, value: `${bot.config.currency}${aBank.toLocaleString()}` })
            .addFields({ name: 'Total', value: `${bot.config.currency}${aTotal.toLocaleString()}` })
            .setFooter({ text: `Requested by ${authorTag}` })
            .setTimestamp();

            message.channel.send({ embeds: [aEmbed] });
        } else if (member.user.bot) { 
            return message.reply("You can't see the bot's balance") 
        }
        // Set cooldown
        return bot.cooldown.set(client, message)
    }
};