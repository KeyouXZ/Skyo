const { EmbedBuilder } = require("discord.js");
const { getMeme } = require("memes-js");

module.exports = {
    name: "meme",
    description: "Get random memes from Reddit",
    cooldown: 10,
    cd: true,
    run: async (client, message, args) => {
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
        });
    },
};
