const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'shop',
  description: 'Display items available in the shop.',
  cooldown: 10,
  run: async (client, message, args, bot) => {
      if (bot.cooldown.has(client, message)) return;
    const itemData = await bot.database.getItemAll();

    const sortedItems = Object.entries(itemData).filter(([_, item]) => item.buyAble).sort(([aKey, _aValue], [bKey, _bValue]) => parseInt(aKey) - parseInt(bKey));

    const embed = new EmbedBuilder()
      .setTitle('Shop')
      .setColor('Blue');

    for (const item  of sortedItems) {
      embed.addFields({ name: `${item[1].name} • ${config.currency}${item[1].price}`, value: `ID: \`${item[1].id}\`` });
    }

    message.channel.send({ embeds: [embed] });
    return bot.cooldown.set(client, message)
  }
};
