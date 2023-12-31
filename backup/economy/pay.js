const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
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
  name: 'pay',
  description: 'Transfer money to the specified person ',
  usage: ['<@user> <amount>'],
  cooldown: 20,
  run: async (client, message, args) => {
    const userID = message.author.id;
    // Cooldowns 
    if (cooldown.has(cooldowns, message.author.id, message)) return;
    const data = await database.get('users', message.author.id);

    const target = message.mentions.members.first();
    if (!target) {
      return deleteMessage(message.reply('Please mention a user'));
    }

    if (target.user.id == message.author.id) {
      return deleteMessage(message.reply('You can\'t give money to yourself'));
    }

    const targetData = await database.get('users', target.id);

    const wallet = data.wallet;
    const tWallet = targetData.wallet;

    const amount = parseInt(args[1]);
    let feeAmount = 0.0146; // 1.46%
    if (data.isPremium === 1) feeAmount = 0; // 0%
    const fee = Math.floor(amount * feeAmount);
    const total = Math.floor(amount - fee);

    if (isNaN(amount)) {
      return deleteMessage(message.reply("Please specify a valid amount."));
    }
    if (args[1].includes('-') || args[1].includes('+') || args[1].includes(',') || args[1].includes('*') || args[1].includes('/') || args[1].includes('%') || args[1].includes('.')) {
      return deleteMessage(message.reply('Syntax error!!'));
    }
    if (amount > wallet) {
      return deleteMessage(message.reply("You don't have enough money in your wallet."));
    }

    const confirm = new ButtonBuilder()
      .setCustomId('confirm')
      .setLabel('Confirm')
      .setStyle(ButtonStyle.Success);

    const cancel = new ButtonBuilder()
      .setCustomId('cancel')
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder()
      .addComponents(confirm, cancel);

    let payMsg = null;

    const payEmbed = new EmbedBuilder()
      .setColor('Blue')
      .setTitle(`${message.author.username}, you will give money to ${target.user.username}`)
      .setDescription(`To confirm press the **Confirm** button\nTo cancel press the **Cancel** button\n\nAmount: ${config.currency}${amount.toLocaleString()}\nFee: ${config.currency}${fee.toLocaleString()}\nReceived: ${config.currency}${total.toLocaleString()}\n\n**Status:** Waiting`)
      .setTimestamp();

    payMsg = await message.channel.send({
      embeds: [payEmbed],
      components: [row]
    });

    let isClicked = false;
    setTimeout(() => {
      if (isClicked == false) {
        confirm.setDisabled(true);
        cancel.setDisabled(true);
        payEmbed.setColor('Red');
        payEmbed.setDescription(`To confirm press the **Confirm** button\nTo cancel press the **Cancel** button\n\nAmount: ${config.currency}${amount.toLocaleString()}\nFee: ${config.currency}${fee}\nReceived: ${config.currency}${total.toLocaleString()}\n\n**Status:** Cancelled (Time Out)`);
        payMsg.edit({ embeds: [payEmbed], components: [row] });
      } else if (isClicked == true) return;
    }, 20000);

    const collector = payMsg.createMessageComponentCollector();

    // Cooldowns
    cooldown.set(cooldowns, message.author.id, module.exports.cooldown);

    collector.on('collect', async interaction => {
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({ content: "You are not authorized to use this button.", ephemeral: true });
      }
      if (interaction.customId === 'confirm') {
        isClicked = true;
        data.wallet -= amount;
        targetData.wallet += total;
        // Database
        database.run('UPDATE users SET wallet = ? WHERE id = ?', [data.wallet, message.author.id]);
        // Database
        database.run('UPDATE users SET wallet = ? WHERE id = ?', [targetData.wallet, target.id]);
        try {
          confirm.setDisabled(true);
          cancel.setDisabled(true);
          payEmbed.setColor('Green');
          payEmbed.setDescription(`To confirm press the **Confirm** button\nTo cancel press the **Cancel** button\n\nAmount: ${config.currency}${amount.toLocaleString()}\nFee: ${config.currency}${fee.toLocaleString()}\nReceived: ${config.currency}${total.toLocaleString()}\n\n**Status:** Confirmed`);
          return interaction.update({ embeds: [payEmbed], components: [row] });
        } catch (err) {
          return console.log(err);
        }
      } else if (interaction.customId === 'cancel') {
        isClicked = true;
        confirm.setDisabled(true);
        cancel.setDisabled(true);
        payEmbed.setColor('Red');
        payEmbed.setDescription(`To confirm press the **Confirm** button\nTo cancel press the **Cancel** button\n\nAmount: ${config.currency}${amount.toLocaleString()}\nFee: ${config.currency}${fee.toLocaleString()}\nReceived: ${config.currency}${total.toLocaleString()}\n\n**Status:** Cancelled`);
        return interaction.update({ embeds: [payEmbed], components: [row] });
      }
      collector.stop();
    });
  }
};