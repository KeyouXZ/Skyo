const client = require("../index");
const { database } = require("../../utils/bot");

client.on("guildMemberAdd", async (member) => {
	const serverID = member.guild.id;
	const welcomeData = await database.getServer(serverID)

	if (!welcomeData) { return };
	if (welcomeData.welcomeChannel === "" || welcomeData.welcomeMessage === "" || welcomeData.welcomeEnable == false) { return };

	const welcomeChannel = welcomeData.welcomeChannel;
	const welcomeMessage = welcomeData.welcomeMessage;

	const channel = member.guild.channels.cache.get(welcomeChannel);
	const user = `<@${member.id}>`;
	const userID = member.id;
	const userTag = member.user.tag;
	const servername = member.guild.name;
	const userName = member.user.username;
	const userCount = member.guild.memberCount;

	const replacedMessage = welcomeMessage
		.replace("{member}", user)
		.replace("{member(id)}", userID)
		.replace("{member(tag)}", userTag)
		.replace("{member(name)}", userName)
		.replace("{server}", servername)
		.replace("{member(count)}", userCount);
	channel.send(replacedMessage);
});
// TMP
