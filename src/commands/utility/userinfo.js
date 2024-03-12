const { EmbedBuilder } = require("discord.js");
const moment = require("moment");

module.exports = {
    name: "userinfo",
    description: "Displays information about a user.",
    cooldown: 10,
    aliases: ["ui"],
    usage: ["[@user]"],
    run: async (client, message, args, bot) => {
        if (bot.cooldown.has(client, message)) return
        
        const member = message.mentions.members.first();
        if (!member) {
            const author = message.author;
            const accountCreatedAt = moment(author.createdAt / 1000);
            const accountCreatedAtFormatted =
                accountCreatedAt.format("<t:x:F> (<t:x:R>)");
            const joinedAt = moment(message.member.joinedAt / 1000);
            const joinedAtFormatted = joinedAt.format("<t:x:F> (<t:x:R>)");

            const role = message.member.roles.cache
                .sort((a, b) => b.position - a.position)
                .map((role) => role.toString());
            const online = new EmbedBuilder()
                .setColor("#0099ff")
                .setTitle(`${author.username}'s Information`)
                .setDescription(
                    `Here is the information we could gather about ${author.username}\'s.`
                )
                .setThumbnail(author.displayAvatarURL())
                .addFields([
                    {
                        name: "User Info",
                        value: `• **Name:** <@${author.id}> \`${
                            author.tag
                        }\`\n• **ID:** ${
                            author.id
                        }\n• **Created:** ${accountCreatedAtFormatted}\n• **Is Bot:** ${
                            author.bot ? "Yes" : "No"
                        }`,
                    },
                    {
                        name: "Member Info",
                        value: `• **Nickname:**  ${
                            author.nickname || "-"
                        }\n• **Joined:** ${joinedAtFormatted}\n• **Highest Role:** ${
                            message.member.roles.highest || "-"
                        }\n• **Roles (${role.length}):**\n${
                            role.join(", ") || "-"
                        }`,
                    },
                    {
                        name: `Permissions (${
                            message.member.permissions.toArray().length
                        })`,
                        value:
                            message.member.permissions.toArray().join(", ") ||
                            "-",
                    },
                ]);
            
            bot.cooldown.set(client, message)
            return message.channel.send({ embeds: [online] });
        }

        const accountCreatedAt = moment(member.user.createdAt / 1000);
        const accountCreatedAtFormatted =
            accountCreatedAt.format("<t:x:F> (<t:x:R>)");
        const joinedAt = moment(member.joinedAt / 1000);
        const joinedAtFormatted = joinedAt.format("<t:x:F> (<t:x:R>)");

        const role = member.roles.cache
            .sort((a, b) => b.position - a.position)
            .map((role) => role.toString());

        const online = new EmbedBuilder()
            .setColor("#0099ff")
            .setTitle(`${member.user.username}'s Information`)
            .setDescription(
                `Here is the information we could gather about ${member.user.username}\'s.`
            )
            .setThumbnail(member.user.displayAvatarURL())
            .addFields([
                {
                    name: "User Info",
                    value: `• **Name:** <@${member.user.id}> \`${
                        member.user.tag
                    }\`\n• **ID:** ${
                        member.user.id
                    }\n• **Created:** ${accountCreatedAtFormatted}\n• **Is Bot:** ${
                        member.user.bot ? "Yes" : "No"
                    }`,
                },
                {
                    name: "Member Info",
                    value: `• **Nickname:**  ${
                        member.nickname || "-"
                    }\n• **Joined:** ${joinedAtFormatted}\n• **Highest Role:** ${
                        member.roles.highest || "-"
                    }\n• **Roles (${role.length}):**\n${
                        role.join(", ") || "-"
                    }`,
                },
                {
                    name: `Permissions (${
                        member.permissions.toArray().length
                    })`,
                    value:
                        member.permissions.toArray().join(", ") ||
                        "-",
                },
            ]);

        message.channel.send({ embeds: [online] });
        return bot.cooldown.set(client, message)
    },
};
