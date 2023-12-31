const { EmbedBuilder } = require('discord.js');
const mPrefix = process.env.CPREFIX;
const config = require('../../../utils/config');
const { database, cooldown } = require('../../../utils/bot');

module.exports = {
  name: 'balance',
  description: 'Check user balance',
  aliases: ["bal"],
  usage: ['[@user]'],
  cooldown: 10,
  cd: true,
  run: async (client, message, args) => {
    const member = message.mentions.members.first();
    const authorId = message.author.id;
    const authorTag = message.author.tag;

    if (!member) {
       const data = await database.get('users', authorId);

        const aWallet = data.wallet;
        const aBank = data.bank;
        const aTotal = aWallet + aBank;

        const aEmbed = new EmbedBuilder()
          .setColor('Blue')
          .setTitle(`${message.author.username}'s Balance`)
          .addFields({ name: `Wallet`, value: `${config.currency}${aWallet.toLocaleString()}` })
          .addFields({ name: `Bank`, value: `${config.currency}${aBank.toLocaleString()}` })
          .addFields({ name: 'Total', value: `${config.currency}${aTotal.toLocaleString()}` })
          .setFooter({ text: `Requested by ${authorTag}` })
          .setTimestamp();

        return message.channel.send({ embeds: [aEmbed] });
     
    } else {
      const userId = member.user.id;
      const userName = member.user.username;
      const userTag = member.user.tag;
      
      const data = await database.get('users', userId);
      
      const wallet = data.wallet;
      const bank = data.bank;
      const total = wallet + bank;
      
      const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`${userName}'s Balance`)
        .addFields({ name: `Wallet`, value: `${config.currency}${wallet.toLocaleString()}`})
        .addFields({ name: `Bank`, value: `${config.currency}${bank.toLocaleString()}`})
        .addFields({ name: 'Total', value: `${config.currency}${total.toLocaleString()}`})
        .setFooter({ text: `Requested by ${userTag}` })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    }
  }
};