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
    name: "welcome",
    description: "Welcome commands",
    usage: ["info", "wiki", "channel [#channel]", "message [message]"],
    cooldown: 10,
    run: async (client, message, args)  => {
        // Cooldowns 
        if (cooldown.has(cooldowns, message.author.id, message)) return;

        const serverID = message.member.guild.id;
        const welcomeData = await database.getServer(serverID);
        
        if (!args[0]) {
            return deleteMessage(message.reply("You must specify options wiki or info or channel or message"))
        }

        if (args[0] !== 'wiki' && args[0] !== 'info' && args[0] !== 'channel' && args[0] !== 'message') {
            return deleteMessage(message.reply('Invalid option. Please choose either "wiki" or info" or "channel" or "message".'))
        }

        switch (args[0]) {
            case "info":
                let iwc = `<#${welcomeData.welcomeChannel}> (${welcomeData.welcomeChannel})`;
                if (welcomeData.welcomeChannel == '') iwc = '-';
                let iwm = `_${welcomeData.welcomeMessage}_`;
                if (welcomeData.welcomeMessage == '') iwm = '-';
                const infoEmbed = new EmbedBuilder()
                .setColor('Blue')
                .addFields(
                    { name: 'Welcome Channel', value: iwc },
                    { name: 'Welcome Message', value: iwm },
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
                break;
            case "channel":
                const channelID = message.mentions.channels.first()?.id;

                if (!channelID) {
                    welcomeData.welcomeChannel = "";
                    database.saveServer(serverID ,welcomeData)
                    message.channel.send('Welcome channel removed')
                    return;
                } else {
                    welcomeData.welcomeChannel = channelID;
                    database.saveServer(serverID, welcomeData)
                    message.channel.send(`Welcome channel updated to <#${channelID}>`);
                }
                break
            case "message":
                const messageArgs = args.slice(1).join(' ');

                if (!messageArgs) {
                    welcomeData.welcomeMessage = "";
                    database.saveServer(serverID, welcomeData)
                    message.channel.send('Welcome message removed')
                    return;
                 } else {
                    welcomeData.welcomeMessage = messageArgs;
                    database.saveServer(serverID, welcomeData)
                    message.channel.send(`Welcome message updated to **${messageArgs}**`);
                }
                break

        }
    }
}