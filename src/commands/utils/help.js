const { EmbedBuilder } = require("discord.js");
const mPrefix = process.env.CPREFIX;

module.exports = {
    name: "help",
    description: "Get the bot commands",
    cooldown: 10,
    cd: true,
    run: async (client, message, args) => {
        const embed = new EmbedBuilder()
            .setTitle("Command List")
            .setDescription(
                `Here is the list of commands!\nFor more info on a specific command, use \`${mPrefix}cmdhelp <command>\`\nNeed more help? Come join our [guild](https://discord.com/invite/valhalla)`
            )
            .addFields([
                {
                    name: "🔧 Utility",
                    value: `ping, botinfo, serverinfo, invite, userinfo, avatar, cmdhelp, premium`,
                },
                {
                    name: "🥇 Rankings",
                    value: `localleaderboard, leaderboard`,
                },
                {
                    name: "💰 Economy",
                    value: `balance, deposit, withdraw, pay, daily, weekly, use, shop`,
                },
                {
                    name: "😆 Fun",
                    value: `meme`,
                },
                {
                    name: "🛡️ Moderation",
                    value: `welcome, goodbye`,
                },
            ])
            .setColor("Blue")
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    },
};
