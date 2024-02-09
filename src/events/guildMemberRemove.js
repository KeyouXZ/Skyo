const client = require("../index");
const fs = require("fs");
const path = require("path");
const { database } = require("../../utils/bot")

client.on("guildMemberRemove", async (member) => {
	const serverID = member.guild.id;
	const goodbyeData = await database.getServer(serverID)
	if (!goodbyeData) { return };
	if (goodbyeData.goodbyeChannel === "" || goodbyeData.goodbyeMessage === "" || goodbyeData.goodbyeEnable == false) { return };

	const goodbyeChannel = goodbyeData.goodbyeChannel;
	const goodbyeMessage = goodbyeData.goodbyeMessage;

	const channel = member.guild.channels.cache.get(goodbyeChannel);

	const user = `<@${member.id}>`;
	const userID = member.id;
	const userTag = member.user.tag;
	const userName = member.user.username;
	const servername = member.guild.name;
	const userCount = member.guild.memberCount;

	const replacedMessage = goodbyeMessage
		.replace("{member}", user)
		.replace("{member(id)}", userID)
		.replace("{member(tag)}", userTag)
		.replace("{member(name)}", userName)
		.replace("{server}", servername)
		.replace("{member(count)}", userCount);
	channel.send(replacedMessage);
});
//
