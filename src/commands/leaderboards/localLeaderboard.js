const { EmbedBuilder } = require('discord.js');
const { util, database, cooldown, config } = require("../../../utils/bot")
// Cooldowns 
const { Collection } = require('discord.js');
const cooldowns = new Collection();
  
module.exports = {
  name: 'localleaderboard',
  description: 'Show the leaderboard of users in the server with the most money or bank',
  aliases: ['llb'],
  usage: ['wallet', 'bank'],   
  cooldown: 10,
  run: async (client, message, args) => {
    if (cooldown.has(cooldowns, message)) return;
    
    if (!args[0]) {
      return util.tempMessage(message, 'You must specify options "wallet" or "bank"')
    }
  
    if (args[0] !== 'wallet' && args[0] !== 'bank') {
        return util.tempMessage(message, 'Invalid option. Please choose either "wallet" or "bank".')
    }
  
    const data = await database.getAll()
    
    // Cooldowns
    cooldown.set(cooldowns, message.author.id);
  
      // WALLET LEADERBOARD
    if (args[0] === 'wallet') {
      const guildMembers = await message.guild.members.fetch(data.userID);

      const dataWallet = await Object.values(data).filter((data) => guildMembers.has(data.userID)).sort((a, b) => b.wallet - a.wallet);
      const leaderboard = [];

        for (let i = 0; i < dataWallet.length && i < 10; i++) {
          const user = await client.users.fetch(dataWallet[i].userID);
          leaderboard.push(`\`${i + 1}.\` ${user?.tag ?? 'Unknown User'} — **${config.currency}${dataWallet[i].wallet.toLocaleString()}**`);
        }
  
        const embed = new EmbedBuilder()
          .setColor('Random')
          .setTitle('Local Wallet Leaderboard')
          .setDescription(leaderboard.join('\n'));
  
        message.channel.send({ embeds: [embed] });
      }
  
      // BANK LEADERBOARD 
      if (args[0] === 'bank') {
        const guildMembers = await message.guild.members.fetch(data.userID);
        const dataBank = await Object.values(data).filter((data) => guildMembers.has(data.userID)).sort((a, b) => b.bank - a.bank);
        const leaderboard = [];

      for (let i = 0; i < dataBank.length && i < 10; i++) {
        const user = await client.users.fetch(dataBank[i].userID);
        leaderboard.push(`\`${i + 1}.\` ${user?.tag ?? 'Unknown User'} — **${config.currency}${dataBank[i].bank.toLocaleString()}**`);
      }
  
      const embed = new EmbedBuilder()
        .setColor('Random')
        .setTitle('Local Bank Leaderboard')
        .setDescription(leaderboard.join('\n'));
  
      message.channel.send({ embeds: [embed] });
    }
  },
};
