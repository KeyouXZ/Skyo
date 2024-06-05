const { EmbedBuilder } = require("discord.js");

module.exports = {
	name: "weekly",
	description: "Claim your weekly reward",
	cooldown: 10,
	premium: true,
	run: async (client, message, args, bot) => {
	    // Check Cooldown
	    if (bot.cooldown.has(client, message)) return;
	    
		const data = await bot.database.get(bot.getAuth(message.author.id));

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
				.setColor("Red")
				.setDescription(
					`⏱️ **|** You have to wait \`${days}D ${hours}H ${minutes}M ${seconds}S.\``
				);
			message.reply({ embeds: [alClaim] });
			return bot.cooldown.set(client, message);
		} else {
			data.wallet += 2170;
			data.lastWeekly = now;
			await bot.database.save(bot.getAuth(message.author.id), data);
			const Claim = new EmbedBuilder()
				.setColor(`Green`)
				.setDescription(
					`You get ${
						bot.config.currency
					}${weeklyAmount.toLocaleString()} from weekly reward`
				);
			message.reply({ embeds: [Claim] });
			return bot.cooldown.set(client, message);
		}
	},
};
