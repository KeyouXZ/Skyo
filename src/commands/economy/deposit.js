const { EmbedBuilder } = require('discord.js');
const mPrefix = process.env.CPREFIX;
const config = require('../../../utils/config');

const { database, cooldown } = require('../../../utils/bot');
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
  name: 'deposit',
  description: 'Deposit wallet to your bank account',
  aliases: ["dep"],
  usage: ['<amount>', 'all'],
  cooldown: 10,
  run: async (client, message, args) => { 
    // Cooldowns
	  if (cooldown.has(cooldowns, message.author.id, message)) return;
    
    const userID = message.author.id;
    const data = await database.get('users', message.author.id);

    const wallet = data.wallet;
    const bank = data.bank;
    
    if (args == 'all') {
    if (wallet === 0) {
      return deleteMessage(message.reply("You don't have money in your wallet to deposit."));
    }
    
    data.bank += wallet;
    data.wallet = 0;
  
    // Database
    database.run('UPDATE users SET bank = ?, wallet = ? WHERE id = ?', [data.bank, data.wallet, message.author.id]);

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
      return deleteMessage(message.reply('Please specify the amount of money to deposit'));
    }
    const amount = parseInt(args[0]);
    if (args[0].includes('-') || args[0].includes('+') || args[0].includes(',') || args[0].includes('*') || args[0].includes('/') || args[0].includes('%') || args[0].includes('.')) {
      return deleteMessage(message.reply('Syntax error!!'));
    }
      if (isNaN(amount)) {
        return deleteMessage(message.reply("Invalid amount."));
      }
      if (amount > wallet) {
        return deleteMessage(message.reply("You don't have enough money in your wallet to deposit that amount."));
      }
      
      data.wallet -= amount;
      data.bank += amount;

      database.run('UPDATE users SET wallet = ?, bank = ? WHERE id = ?', [data.wallet, data.bank, message.author.id]);

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