module.exports = {
	name: 'ping',
	description: "Check bot's ping.",
	cooldown: 10,
	run: async (client, message, args, bot) => {
	    if (bot.cooldown.has(client, message)) return
	    bot.cooldown.set(client, message)
		await message.channel.send(`🏓 Pong! **${client.ws.ping} ms**`)
	}
};