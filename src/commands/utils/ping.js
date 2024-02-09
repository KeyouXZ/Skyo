module.exports = {
	name: 'ping',
	description: "Check bot's ping.",
	cooldown: 10,
	cd: true,
	run: async (client, message, args) => {
		await message.channel.send(`🏓 Pong! **${client.ws.ping} ms**`)
	}
};