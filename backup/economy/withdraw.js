const path = require('path');
const fs = require('fs');
const { EmbedBuilder } = require('discord.js');
const mPrefix = process.env.CPREFIX;
const { database, cooldown } = require('../../../utils/bot');
const config = require('../../../utils/config');
// Cooldown
const { Collection } = require('discord.js');
const cooldowns = new Collection();

// Delete Message
function deleteMessage(message, timeout) {
  message.then(msg => {
    setTimeout(() => {
      msg.delete();
    }, 15000);
  });
}

module.exports = {
  name: 'withdraw',
  description: 'Withdraw bank to your wallet',
  aliases: ["wd"],
  usage: ['<amount>', 'all'],
  cooldown: 10,
  run: async (client, message, args) => {
      // Cooldowns 
    if (cooldown.has(cooldowns, message.author.id, message)) return;
      
    const userID = message.author.id;
    const data = await database.get('users', message.author.id);

    const bank = data.bank;
    const wallet = data.wallet;
    
    if (args == 'all') {
      if (bank === 0) {
        return deleteMessage(message.reply("You don't have money in your bank to withdraw."));
      }
      data.wallet += bank;
      data.bank = 0;
  
      // Database
      database.run('UPDATE users SET wallet = ?, bank = ? WHERE id = ?', [data.wallet, data.bank, message.author.id]);
  

  const embed = new EmbedBuilder()
    .setColor('Green')
    .setTitle(`Withdraw Successful (${config.currency}${bank.toLocaleString()})`)
    .addFields({ name: `Wallet`, value: `${config.currency}${data.wallet.toLocaleString()}`})
    .addFields({ name: `Bank`, value: `${config.currency}${data.bank.toLocaleString()}`})
    .setFooter({ text: `Requested by ${message.author.tag}`})
    .setTimestamp();

   message.channel.send({ embeds: [embed] });
       // Cooldowns
       return cooldown.set(cooldowns, message.author.id, module.exports.cooldown);
    }
    
      if (!args[0]) {
        return deleteMessage(message.reply('Please specified the amount of money to withdraw'));
      }
      
      const amount = parseInt(args[0]);
      if (args[0].includes('-') || args[0].includes('+') || args[0].includes(',') || args[0].includes('*') || args[0].includes('/') || args[0].includes('%') || args[0].includes('.')) {
      return deleteMessage(message.reply('Syntax error!!'));
      }
      if (isNaN(amount)) {
        return deleteMessage(message.reply("Invalid amount."));
      }
      if (amount > bank) {
        return deleteMessage(message.reply("You don't have enough money in your bank to withdraw that amount."));
      }
     
      data.bank -= amount;
      data.wallet += amount;

      // Database
      database.run('UPDATE users SET bank = ?, wallet = ? WHERE id = ?', [data.bank, data.wallet, message.author.id]);

      const embed0 = new EmbedBuilder()
        .setColor('Green')
        .setTitle(`Withdraw Successful (${config.currency}${amount.toLocaleString()})`)
        .addFields({ name: `Wallet`, value: `${config.currency}${data.wallet.toLocaleString()}`})
        .addFields({ name: `Bank`, value: `${config.currency}${data.bank.toLocaleString()}`})
        .setFooter({text: `Requested by ${message.author.tag}`})
        .setTimestamp();
        
      message.channel.send({ embeds: [embed0] });
      // Cooldowns
      return cooldown.set(cooldowns, message.author.id, module.exports.cooldown);
  }
  };