const { EmbedBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
    name: "web",
    description: "Checks the status of a website.",
    aliases: ["wc"],
    cooldown: 10,
    usage: ["<https://address.com>"],
    run: async (client, message, args, bot) => {
        if (bot.cooldown.has(client, message)) return

        let websiteURL = args[0];

        if (!websiteURL) {
            return bot.util.tempMessage(message, "You need to provide a website URL.")
        }
        
        if (!websiteURL.includes("https://") || !websiteURL.includes("http://")) {
            websiteURL = "http://" + websiteURL;
        }

        // Cooldowns
        bot.cooldown.set(client, message);

        axios
            .get(websiteURL)
            .then((response) => {
                const embed = new EmbedBuilder()
                    .setColor(`#57F288`)
                    .setTitle(`Status of ${websiteURL}`)
                    .setDescription("The website is online.")
                    .setTimestamp();

                message.channel.send({ embeds: [embed] });
            })
            .catch((error) => {
                const embed = new EmbedBuilder()
                    .setColor("#ED4245")
                    .setTitle(`Status of ${websiteURL}`)
                    .setDescription(
                        `The website is offline or could not be reached. Error: ${error.code}`
                    )
                    .setTimestamp();

                message.channel.send({ embeds: [embed] });
            });
    },
};
