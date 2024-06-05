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

        let userId;
        if (member && !member.user.bot) {
            userId = member.user.id
        } else if (!member) {
            userId = message.author.id
        }

        const data = await bot.database.get(bot.getAuth(userId));
        if (!data) {
            return message.reply(`${member.user.username} doesn't have an account`)
        }
  
        const wallet = data.wallet;
        const bank = data.bank;
        const total = wallet + bank;

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle(`${data.username}'s Balance`)
            .addFields({ name: `Wallet`, value: `${bot.config.currency}${wallet.toLocaleString()}`})
            .addFields({ name: `Bank`, value: `${bot.config.currency}${bank.toLocaleString()}`})
            .addFields({ name: 'Total', value: `${bot.config.currency}${total.toLocaleString()}`})
            .setFooter({ text: `Requested by ${message.author.tag}` })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });

        // Set cooldown
        return bot.cooldown.set(client, message)
    }
};