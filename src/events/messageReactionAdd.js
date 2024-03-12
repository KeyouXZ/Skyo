const { database, util } = require("../../utils/bot");
const client = require("../index");

client.on("messageReactionAdd", async (reaction, user) => {
	if (user.bot) return;

	const data = await database.getServer(reaction.message.guild.id);
	const rr = data.reactionrole.find(
		(rr) =>
			rr.messageID === reaction.message.id &&
			rr.emoji === reaction.emoji.name
	);

	if (rr) {
		const role = reaction.message.guild.roles.cache.get(rr.role);
		if (role && reaction.message.guild.members.cache.has(user.id)) {
			try {
				reaction.message.guild.members.cache.get(user.id).roles.add(role);
			} catch (err) {
				return
			}
		}
	}
});
