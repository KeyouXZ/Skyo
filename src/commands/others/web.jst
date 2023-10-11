const { EmbedBuilder } = require("discord.js");
const axios = require("axios");
const { cooldown, util } = require("../../../utils/bot")
// Cooldowns
const { Collection } = require("discord.js");
const cooldowns = new Collection();

module.exports = {
    name: "web",
    description: "Checks the status of a website.",
    aliases: ["wc"],
    cooldown: 10,
    usage: ["<https://address.com>"],
    run: async (client, message, args) => {
        if (cooldown.has(cooldowns, message)) return

        const websiteURL = args[0];

        if (!websiteURL) {
            return util.tempMessage(message, "You need to provide a website URL.")
        }

        // Cooldowns
        cooldown.set(cooldowns, message.author.id);

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
