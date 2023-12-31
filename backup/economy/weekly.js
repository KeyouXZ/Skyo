const { EmbedBuilder } = require('discord.js');
const mPrefix = process.env.CPREFIX;
const { database, cooldown } = require('../../../utils/bot');
const config = require('../../../utils/config');

module.exports = {
  name: 'weekly',
  description: 'Claim your weekly reward',
  cooldown: 10,
  cd: true,
  premium: true,
  run: async (client, message, args) => {
    const userId = message.author.id;
    const data = await database.get('users', message.author.id);

    const lastWeekly = data.lastWeekly || 0;
    const wallet = data.wallet;

    const now = Date.now();
    const timeDifference = now - lastWeekly;
    const timeRemaining = (604800000 - timeDifference) / 1000;

    if (timeDifference < 604800000) {
      const days = Math.floor((timeRemaining % 604800) / 86400);
      const hours = Math.floor((timeRemaining % 86400) / 3600);
      const minutes = Math.floor((timeRemaining % 3600) / 60);
      const seconds = Math.floor(timeRemaining % 60);
      
      const alClaim = new EmbedBuilder()
      .setColor('Red')
      .setDescription(`⏱️ **|** You have to wait \`${days}D ${hours}H ${minutes}M ${seconds}S.\``);
      message.reply({ embeds: [alClaim] });
    } else {
      const weeklyAmount = 2170;
      const newWallet = wallet + weeklyAmount;
      const newLastWeekly = now;
      await database.run('UPDATE users SET wallet = ?, lastWeekly = ? WHERE id = ?', [newWallet, newLastWeekly, message.author.id]);
      
      const Claim = new EmbedBuilder()
      .setColor(`Green`)
      .setDescription(`You get ${config.currency}${weeklyAmount.toLocaleString()} from weekly reward`);
      message.reply({ embeds: [Claim] });
    }
  }
};