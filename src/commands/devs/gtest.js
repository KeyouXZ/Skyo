const { database } = require("../../../utils/bot");

module.exports = {
    name: "gtest",
    dev: true,
    run: async (client, message, args) => {
        const serverID = message.guild.id;
        const welcomeData = await database.getServer(serverID)

        if (!welcomeData) { return };
        if (welcomeData.goodbyeChannel === "" || welcomeData.goodbyeMessage === "" || welcomeData.goodbyeEnable == false) { return message.reply("Goodbye disable") };

        const welcomeChannel = welcomeData.welcomeChannel;
        const welcomeMessage = welcomeData.welcomeMessage;

        const user = `<@${message.author.id}>`;
        const userID = message.author.id
        const userTag = message.author.tag;
        const servername = message.guild.name;
        const userName = message.author.username;
        const userCount = message.guild.memberCount;

        const replacedMessage = welcomeMessage
            .replace("{member}", user)
            .replace("{member(id)}", userID)
            .replace("{member(tag)}", userTag)
            .replace("{member(name)}", userName)
            .replace("{server}", servername)
            .replace("{member(count)}", userCount);
        message.channel.send(replacedMessage);
    }
}
// TMP
