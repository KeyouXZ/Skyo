const { EmbedBuilder } = require('discord.js');
const { database, cooldown } = require('../../../utils/bot');
const config = require('../../../utils/config');

module.exports = {
  name: 'daily',
  description: 'Claim your daily reward',
  cooldown: 10,
  cd: true,
  run: async (client, message, args) => {
    const userId = message.author.id;
    const data = await database.get('users', message.author.id);

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

      const newWallet = wallet + dailyAmount + additionalAmount;
      const newLastDaily = now;
      // Update data
      await database.run('UPDATE users SET wallet = ?, lastDaily = ? WHERE id = ?', [newWallet, newLastDaily, message.author.id]);

      if (data.isPremium == 1) {
        messageContent = `You received ${config.currency}${dailyAmount} + ${config.currency}${additionalAmount} from your daily reward.`;
      } else {
        messageContent = `You get ${config.currency}${dailyAmount.toLocaleString()} from daily reward.`;
      }

      const claimEmbed = new EmbedBuilder()
        .setColor('Green')
        .setDescription(messageContent);
      message.reply({ embeds: [claimEmbed] });
    }
  },
};
