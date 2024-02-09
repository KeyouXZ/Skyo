const { EmbedBuilder } = require("discord.js");
const { database, cooldown, config, util } = require("../../../utils/bot")
// Cooldowns
const { Collection } = require("discord.js");
const cooldowns = new Collection();

module.exports = {
	name: "reactionrole",
	description: "Recation role command.",
	usage: ["add <messageid> <emoji> <@&role> [#channel]", "del <messageid> <emoji> <@&role> [#channel]"],
	aliases: ["rr"],
	cooldown: 10,
	userPerms: ["ManageMessages", "ManageRoles"],
	run: async (client, message, args) => {
		if (cooldown.has(cooldowns, message)) return

		if (!args[0]) return util.tempMessage(message, "Please specify options \"add\" or \"del\"")

		const data = await database.getServer(message.guild.id)
		if (args[0] == "add") {
			const msgID = args[1]
			if (!msgID) {
				return util.tempMessage(message, "Please specify message ID")
			} else if (isNaN(parseInt(msgID))) {
				return util.tempMessage(message, "Invalid message ID")
			}
			
			const channelID = message.mentions.channels.first()?.id || message.channel.id
			try {
                var fetchMsgID = await client.channels.fetch(channelID);
                fetchMsgID = await fetchMsgID.messages.fetch(msgID);
			} catch (err) {
				return util.tempMessage(message, "Can't find message with that ID on this channel")
			}

			const emoji = args[2]
			const emojiPattern = /[\uD83C-\uDBFF\uDC00-\uDFFF\uD83D\uDC00-\uDE4F\uD83D\uDE80-\uDEFF\u2700-\u27BF\u2300-\u23FF\u2B50\u2600-\u26FF\u20D0-\u20FF]+/g;
			if (!emoji) {
				return util.tempMessage(message, "Please specify emoji")
			} else if (!emojiPattern.test(emoji)) {
				return util.tempMessage(message, "Invalid emoji")
			}

			const role = message.mentions.roles.first()
			if (!role) {
				return util.tempMessage(message, "Please mention role")
			}

			const conflictingRR = data.reactionrole.find(rr => rr.messageID === msgID && (rr.emoji === emoji || rr.role === role.id));
			if (conflictingRR) {
				return util.tempMessage(message, "A reaction role with the same message ID or role already exists with a different emoji.");
			}

			const newRR = {
				messageID: msgID,
				channelID,
				emoji,
				role: role.id
			}

			data.reactionrole.push(newRR)
			await database.saveServer(message.guild.id, data)
			fetchMsgID.react(emoji)
			message.channel.send(`Added ${emoji} with role <@&${role.id}>`)
			return

		} else if (args[0] == "del") {
			const msgID = args[1]
			if (!msgID) {
				return util.tempMessage(message, "Please specify message ID");
			} else if (isNaN(parseInt(msgID))) {
				return util.tempMessage(message, "Invalid messsage ID");
			}

			const channelID = message.mentions.channels.first()?.id || message.channel.id
			try {
                var fetchMsgID = await client.channels.fetch(channelID);
                fetchMsgID = await fetchMsgID.messages.fetch(msgID);
			} catch (err) {
				return util.tempMessage(message, "Can't find message with that ID on this channel")
			}

			const emoji = args[2]
			const emojiPattern = /[\uD83C-\uDBFF\uDC00-\uDFFF\uD83D\uDC00-\uDE4F\uD83D\uDE80-\uDEFF\u2700-\u27BF\u2300-\u23FF\u2B50\u2600-\u26FF\u20D0-\u20FF]+/g;
			if (!emoji) {
				return util.tempMessage(message, "Please specify emoji")
			} else if (!emojiPattern.test(emoji)) {
				return util.tempMessage(message, "Invalid emoji")
			}
			
			const role = message.mentions.roles.first()
			if (!role) {
				return util.tempMessage(message, "Please mention role");
			}

			const matchingRRIndex = data.reactionrole.findIndex(rr => rr.messageID === msgID && rr.role === role.id);

			if (matchingRRIndex !== -1) {
				const emoji = data.reactionrole[matchingRRIndex].emoji;

				const reaction = fetchMsgID.reactions.cache.find(r => r.emoji.name === emoji);

				if (reaction) {
					fetchMsgID.reactions.cache.get(emoji).remove()

					data.reactionrole.splice(matchingRRIndex, 1);

					await database.saveServer(message.guild.id, data);

					message.channel.send(`Deleted reaction role with id ${msgID} and role ${role}`);
				} else {
					return util.tempMessage(message, "Error while finding reaction role");
				}
			} else {
				return util.tempMessage(message, "There are no matching reaction role entries for the specified message ID and role");
			}
			return
		} else if (args[0] == "list") {
			const listEmbed = new EmbedBuilder()
		    .setTitle("Reaction Role List")
			.setColor("Random");

	    	let msg = ""

			let num = 0
			data.reactionrole.forEach((c) => {
				num++;
				msg += `**${num}**\nMessage ID: ${c.messageID} (<#${c.channelID}>)\nEmoji: ${c.emoji}\nRole: <@&${c.role}>\n`
				// listEmbed.addFields({
				// 	name: num,
				// 	value: `Message ID: ${c.messageID}\nEmoji: ${c.emoji}\nRole: <@&${c.role}>`
				// })
			})
			if (!msg) msg += "Empty"
			listEmbed.setDescription(msg)
			message.channel.send({ embeds: [listEmbed] })
			return
		} else {
			return util.tempMessage(message, "Please specify a valid subcommand");
		}
	}
}