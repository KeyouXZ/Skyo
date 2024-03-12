const { EmbedBuilder } = require("discord.js");
const prettyMilliseconds = require("pretty-ms");
const moment = require("moment");

module.exports = {
	name: "botinfo",
	aliases: ["bi"],
	description: "Get bot information",
	cooldown: 10,
	run: async (client, message, args, bot) => {
		if (bot.cooldown.has(client, message)) return;
		
		const createdAt = moment(client.user.createdAt / 1000);
		const createdAtFormatted = createdAt.format("<t:x:F> (<t:x:R>)");
		const embed = new EmbedBuilder()
			.setTitle("Bot Information")
			.addFields(
				{
					name: `General`,
					value: `**Name :** ${client.user.username}\n**ID :** ${client.user.id}\n**Tag :** ${client.user.discriminator}\n**Created At :** ${createdAtFormatted}\n**Developer :** <@${bot.config.developer.join(", ")}>\n**Prefix :** ${client.prefix.join(", ")}\n**Uptime :** ${prettyMilliseconds(client.uptime)}`,
				},
				{
					name: "Total",
					value: `**Member :** ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)}\n**Server :** ${client.guilds.cache.size}\n**Channel :** ${client.channels.cache.size}`,
				},
			)
			.setColor("Blue")
			.setTimestamp();
		message.channel.send({ embeds: [embed] });
		return bot.cooldown.set(client, message)
	},
};
