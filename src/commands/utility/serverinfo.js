const { EmbedBuilder, ChannelType } = require("discord.js");
const moment = require("moment");

const ecfL = {
    0: "Disable",
    1: "Members without role",
    2: "All members",
};

const pT = {
    0: "None",
    1: "Tier 1",
    2: "Tier 2",
    3: "Tier 3",
};

const mL = {
    0: "None",
    1: "Elevated",
};

const nL = {
    0: "Default",
    1: "Explicit",
    2: "Safe",
    3: "Age Restricted",
};

const vL = {
    0: "None",
    1: "Low",
    2: "Medium",
    3: "High",
    4: "Very high",
};

module.exports = {
    name: "serverinfo",
    aliases: ["si"],
    description: "Get information about this server",
    cooldown: 10,
    run: async (client, message, args, bot) => {
        if (bot.cooldown.has(client, message)) return
        
        const roles = message.guild.roles.cache
            .sort((a, b) => b.position - a.position)
            .map((role) => role.toString());
        const members = await message.guild.members.fetch();
        const channelsCount = message.guild.channels.cache;
        const emojis = await message.guild.emojis.fetch();
        const TimeCreated = moment(message.guild.createdTimestamp / 1000);
        const TimeCreatedFormatted = TimeCreated.format("<t:x:F> (<t:x:R>)");

        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setTimestamp()
            .setTitle("**Server Information**")
            .addFields([
                {
                    name: "General",
                    value: `**Name :** ${message.guild.name}\n**ID :** ${message.guild.id}\n**Owner :** <@${message.guild.ownerId}>\n**Time Created :** ${TimeCreatedFormatted}`,
                },
                {
                    name: "Security",
                    value: `**Verification Level :** ${
                        vL[message.guild.verificationLevel]
                    }\n**NSFW Level :** ${
                        nL[message.guild.nsfwLevel]
                    }\n**MFA Level :** ${
                        mL[message.guild.mfaLevel]
                    }\n**Explicit Content Filter Level :** ${
                        ecfL[message.guild.explicitContentFilter]
                    }`,
                },
                {
                    name: `Members (${message.guild.memberCount})`,
                    value: `**Humans :** ${
                        members.filter((member) => !member.user.bot).size
                    }\n**Bots :** ${
                        members.filter((member) => member.user.bot).size
                    }`,
                },
                {
                    name: `Emojis (${emojis.size})`,
                    value: `**Regular :** ${
                        emojis.filter((emoji) => !emoji.animated).size
                    }\n**Animated :** ${
                        emojis.filter((emoji) => emoji.animated).size
                    }`,
                },
                {
                    name: `Nitro`,
                    value: `**Boost :** ${
                        message.guild.premiumSubscriptionCount || "0"
                    }\n**Tier :** ${pT[message.guild.premiumTier]}`,
                },
                {
                    name: `Channels, Thread & Category (${channelsCount.size})`,
                    value: `**Text Channels :** ${
                        channelsCount.filter(
                            (channel) => channel.type === ChannelType.GuildText
                        ).size
                    }\n**Voice Channels :** ${
                        channelsCount.filter(
                            (channel) => channel.type === ChannelType.GuildVoice
                        ).size
                    }`,
                },
                {
                    //  name: `Roles (${roles.length})`,
                    //  value: roles.join(', ')
                    name: `Roles`,
                    value: `${roles.length} roles`,
                },
            ]);

        message.channel.send({ embeds: [embed] });
        return bot.cooldown.set(client, message)
    },
};
