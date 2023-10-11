const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");

module.exports = {
    name: "avatar",
    description: "Display user's avatar",
    cooldown: 10,
    cd: true,
    usage: ["[@user]"],
    run: async (client, message, args) => {
        const users = message.mentions.members.first();

        if (!users) {
            const author = message.author;
            const embed = new EmbedBuilder()
                .setTitle(`${author.username}'s avatar`)
                .setImage(author.displayAvatarURL({ size: 4096 }))
                .setColor("Random")
                .setTimestamp();

            const formats = ["png", "jpg", "jpeg"];
            const components = [];
            formats.forEach((format) => {
                let imageOptions = {
                    extension: format,
                    forceStatic: format == "gif" ? false : true,
                };

                if (author.avatar == null && format !== "png") return;
                components.push(
                    new ButtonBuilder()
                        .setLabel(format.toUpperCase())
                        .setStyle("Link")
                        .setURL(author.displayAvatarURL(imageOptions))
                );
            });

            const row = new ActionRowBuilder().addComponents(components);
            return message.channel.send({ embeds: [embed], components: [row] });
        }

        const embed = new EmbedBuilder()
            .setTitle(`${users.user.username}'s avatar`)
            .setImage(users.displayAvatarURL({ size: 4096 }))
            .setColor("Random")
            .setTimestamp();

        const formats = ["png", "jpg", "jpeg"];
        const components = [];
        formats.forEach((format) => {
            let imageOptions = {
                extension: format,
                forceStatic: format == "gif" ? false : true,
            };

            if (users.avatar == null && format !== "png") return;
            components.push(
                new ButtonBuilder()
                    .setLabel(format.toUpperCase())
                    .setStyle("Link")
                    .setURL(users.displayAvatarURL(imageOptions))
            );
        });

        const row = new ActionRowBuilder().addComponents(components);
        message.channel.send({ embeds: [embed], components: [row] });
    },
};
