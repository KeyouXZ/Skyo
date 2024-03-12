const { EmbedBuilder } = require("discord.js");
const { getMeme } = require("memes-js");

module.exports = {
    name: "meme",
    description: "Get random memes from Reddit",
    cooldown: 10,
    run: async (client, message, args, bot) => {
        // Check cooldown
        if (bot.cooldown.has(client, message)) return
        const meme = getMeme("meme").then(function (meme) {
            const embed = new EmbedBuilder()
                .setTitle(`${meme.title}`)
                .setDescription(
                    `Author: ${meme.author}\n${meme.ups} likes - ${meme.comments} comments`
                )
                .setImage(`${meme.url}`)
                .setColor("Random")
                .setTimestamp();
            message.reply({ embeds: [embed] });
            return bot.cooldown.set(client, message);
        });
    },
};
