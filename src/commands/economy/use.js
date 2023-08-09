const moment = require('moment');
const { database, cooldown } = require('../../../utils/bot');
// Cooldown
const { Collection } = require('discord.js');
const cooldowns = new Collection();

// Delete Message
function deleteMessage(message) {
  message.then(msg => {
    setTimeout(() => {
      msg.delete();
    }, 15000);
  });
}

module.exports = {
  name: 'use',
  description: 'Use an item',
  cooldown: 10,
  usage: ['<itemId> [amount]', '<itemId> all'],
  run: async (client, message, args) => {
    // Read database
    const data = await database.get('users', message.author.id);
    const itemData = await database.getGlobalAll('globalItems');
    const userItem = await database.get('userItems', message.author.id);
    
    // Cooldowns
    // Cooldowns
	  if (cooldown.has(cooldowns, message.author.id, message)) return;
    
    const userId = message.author.id;
    const user = data;
    const item = itemData.find((item) => item.id === args[0]);
    
    if (!args[0]) {
      return deleteMessage(message.reply(`Please specify item id to use`));
    }

    if (!item) {
      return deleteMessage(message.reply('Invalid item ID'));
    }
    
    if (!userItem[args[0]] || userItem[args[0]] < 1) {
      return deleteMessage(message.reply(`You don't have this item`));
    }
    
    if (item.type !== 1) {
      return deleteMessage(message.reply('This item cannot be used'));
    } 
    
    
    // Cooldowns
    cooldown.set(cooldowns, message.author.id, module.exports.cooldown);
    
    // Premium items 
    // Map item ID to premium duration
    const premiumDurations = {
      'p1m': 30,
      'p2m': 60,
      'p3m': 90,
      'p12m': 365,
    };
    
    if (premiumDurations[args[0]]) {
      if (user.isPremium === 1) {
        return message.reply(`You already have an active premium`);
      }
      
      user.isPremium = 1;
      user.premiumDate = moment().toISOString();
      user.premiumDuration = premiumDurations[args[0]];
      const newItem = userItem[args[0]] -1;
      await database.run('UPDATE users SET isPremium = ?, premiumDate = ?, premiumDuration = ? WHERE id = ?', [user.isPremium, user.premiumDate, user.premiumDuration, message.author.id]);
      await database.run(`UPDATE userItems SET ${args[0]} = ? WHERE id = ?`, [newItem, message.author.id]);
     
      return message.channel.send(`${message.author.username}! Premium has been set for ${premiumDurations[args[0]]} days to your account!`);
    }
    
    if (item == 5) {
      message.reply('Hello');
    }
    
    //
  },
};
