const { EmbedBuilder } = require("discord.js");
const { readdirSync } = require("fs");

module.exports = {
	name: "cmdhelp",
	aliases: ["ch"],
	cooldown: 10,
	usage: ["<command/alias>"],
	description: "Tells Information About Commands",
	run: async (client, message, args, bot) => {
		if (bot.cooldown.has(client, message)) return;

		if (!args[0]) {
			return bot.util.tempMessage(message,
				"Please Specified A Command Name.",
			);
		} else {
			const command =
				client.commands.get(args[0].toLowerCase()) ||
				client.commands.find(
					(c) =>
						c.aliases && c.aliases.includes(args[0].toLowerCase()),
				);

			// To this

			if (!command) {
				return bot.util.tempMessage(
					message,
					`Invalid command! Use \`${client.prefix[0]}help\` for all of my commands!`,
				);
			}

			// Cooldowns
			bot.cooldown.set(client, message)

			const embed = new EmbedBuilder()
				.setTitle("Command Details")
				.setColor("Blue")
				.setDescription(
					`**Symbols Information**\n• <> = Require\n• [] = Optional\n*Note:* Do not use the symbol above when using the command`,
				)
				.addFields({
					name: "Command",
					value: command.name ? `${command.name}` : "No name",
				})
				.addFields({
					name: "Description",
					value: command.description
						? command.description
						: "No description.",
				})
				.addFields({
					name: "Aliases",
					value: command.aliases
						? `${command.aliases.join(" ,")}`
						: "No aliases.",
				})
				.addFields({
					name: "Usage",
					value: command.usage
						? `${client.prefix[0]}${command.name} ${command.usage.join(`\n${client.prefix[0]}${command.name} `)}`
						: `${client.prefix[0]}${command.name}`,
				})
				.addFields({
					name: "Cooldown",
					value: command.cooldown
						? `${command.cooldown} seconds`
						: `None`,
				})
				.addFields({
					name: "Premium Only",
					value: command.premium ? `${command.premium}` : `False`,
				})
				.setFooter({
					text: `Requested by ${message.author.tag}`,
					iconURl: message.author.displayAvatarURL({ dynamic: true }),
				})
				.setTimestamp();
			message.channel.send({ embeds: [embed] });
		}
	},
};
