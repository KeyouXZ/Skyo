const { EmbedBuilder, Collection } = require("discord.js");
const { database, cooldown } = require("../../../utils/bot");
const cooldowns = new Collection()

// Delete Message
function deleteMessage(message) {
    message.then(msg => {
        setTimeout(() => {
            msg.delete();
        }, 15000);
    });
}

module.exports = {
    name: "goodbye",
    description: "Goodbye commands",
    usage: ["info", "wiki", "channel [#channel]", "message [message]"],
    cooldown: 10,
    run: async (client, message, args)  => {
        // Cooldowns 
        if (cooldown.has(cooldowns, message.author.id, message)) return;

        const serverID = message.member.guild.id;
        const goodbyeData = await database.getServer(serverID);
        
        if (!args[0]) {
            return deleteMessage(message.reply("You must specify options wiki or info or channel or message"))
        }

        if (args[0] !== 'wiki' && args[0] !== 'info' && args[0] !== 'channel' && args[0] !== 'message') {
            return deleteMessage(message.reply('Invalid option. Please choose either "wiki" or info" or "channel" or "message".'))
        }

        switch (args[0]) {
            case "info":
                let iwc = `<#${goodbyeData.goodbyeChannel}> (${goodbyeData.goodbyeChannel})`;
                if (goodbyeData.goodbyeChannel == '') iwc = '-';
                let iwm = `_${goodbyeData.goodbyeMessage}_`;
                if (goodbyeData.goodbyeMessage == '') iwm = '-';
                const infoEmbed = new EmbedBuilder()
                .setColor('Blue')
                .addFields(
                    { name: 'Goodbye Channel', value: iwc },
                    { name: 'Goodbye Message', value: iwm },
                )
                .setTimestamp();
                return message.channel.send({ embeds: [infoEmbed]})
                break;
            case "wiki":
                const wikiEmbed = new EmbedBuilder()
                .setColor('Blue')
                .addFields({ name: 'Useful Variables', value: `{member} - Mentions the person joining/leaving.\n{server} - The server's name.\n{member(name)} - The person joining/leaving's username.\n{member(id)} - The person joining/leaving's id.\n{member(tag)} - The person joining/leaving's name in the 'User#0001' format.\n{member(count)} - The total number of members after the event has happened.`})
                .setTimestamp();
                
                return message.channel.send({embeds: [wikiEmbed]})
            case "channel":
                const channelID = message.mentions.channels.first()?.id;

                if (!channelID) {
                    goodbyeData.goodbyeChannel = "";
                    database.saveServer(serverID ,goodbyeData)
                    message.channel.send('Goodbye channel removed')
                    return;
                } else {
                    goodbyeData.goodbyeChannel = channelID;
                    database.saveServer(serverID, goodbyeData)
                    message.channel.send(`Goodbye channel updated to <#${channelID}>`);
                }
                break
            case "message":
                const messageArgs = args.slice(1).join(' ');

                if (!messageArgs) {
                    goodbyeData.goodbyeMessage = "";
                    database.saveServer(serverID, goodbyeData)
                    message.channel.send('Goodbye message removed')
                    return;
                 } else {
                    goodbyeData.goodbyeMessage = messageArgs;
                    database.saveServer(serverID, goodbyeData)
                    message.channel.send(`Goodbye message updated to **${messageArgs}**`);
                }
                break

        }
    }
}