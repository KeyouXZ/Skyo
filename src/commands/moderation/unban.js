const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Collection,
} = require("discord.js");

module.exports = {
    name: "unban",
    description: "Unban a user from the server",
    usage: ["<userid>"],
    cooldown: 10,
    userPerms: ["BanMembers"],
    run: async (client, message, args, bot) => {
        if (bot.cooldown.has(client, message)) return;

        const userId = args[0];

        if (!userId) return bot.util.tempMessage(message, "User id cannot be empty")
        
        let ban = await message.guild.bans.fetch()
        if (ban.get(userId)) {
            message.guild.members.unban(userId)
            message.channel.send(`<@${userId}> was unbanned!`)
        } else {
            message.channel.send("User is not banned!")
        }

        return bot.cooldown.set(client, message);
    }
}