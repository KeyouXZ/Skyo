const { EmbedBuilder } = require("discord.js");
const { database, cooldown, config } = require("../../../utils/bot");

module.exports = {
	name: "weekly",
	description: "Claim your weekly reward",
	cooldown: 10,
	cd: true,
	premium: true,
	run: async (client, message, args) => {
		const userId = message.author.id;
		const data = await database.get(userId);

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
			return message.reply({ embeds: [alClaim] });
		} else {
			data.wallet += 2170;
			data.lastWeekly = now;
			await database.save(message.author.id, data);
			const Claim = new EmbedBuilder()
				.setColor(`Green`)
				.setDescription(
					`You get ${
						config.currency
					}${weeklyAmount.toLocaleString()} from weekly reward`
				);
			return message.reply({ embeds: [Claim] });
		}
	},
};
