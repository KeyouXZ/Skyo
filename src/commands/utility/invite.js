const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");

module.exports = {
    name: "invite",
    description: "Get the bot's invite link",
    cooldown: 10,
    run: async (client, message, args, bot) => {
        if (bot.cooldown.has(client, message)) return;
        bot.cooldown.set(client, message);
        const client_id = process.env.CLIENT_ID ? process.env.CLIENT_ID : client.user.id;
        if (!client_id) return message.channel.send("Error while fetching bot id")
        const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${client_id}&permissions=8&scope=bot%20applications.commands`;
        const embed = new EmbedBuilder()
            .setTitle("Invite me")
            .setDescription(
                `Invite the bot to your server. [Click here](${inviteUrl})`
            )
            .setColor("Aqua")
            .setTimestamp()
            .setThumbnail(client.user.displayAvatarURL())
            .setFooter({ text: client.user.tag });

        const actionRow = new ActionRowBuilder().addComponents([
            new ButtonBuilder()
                .setLabel("Invite")
                .setURL(inviteUrl)
                .setStyle(5),
        ]);
        message.channel.send({ embeds: [embed], components: [actionRow] });
    },
};
