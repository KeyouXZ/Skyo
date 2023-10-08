const { EmbedBuilder, Collection, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
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
    cooldown: 20,
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
        
        const confirm = new ButtonBuilder()
        .setCustomId("confirm")
        .setLabel("Confirm")
        .setStyle(ButtonStyle.Danger);

        const cancel = new ButtonBuilder()
        .setCustomId("cancel")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
        .addComponents(confirm, cancel)

        let confirmMSG;
        if (args[0] == "channel" || args[0] == 'message' && !args[1]) {
            confirmMSG = await message.reply({
                content: `Do you want to delete the goodbye ${args[0]}?`,
                    components: [row]
                })

            var collector = confirmMSG.createMessageComponentCollector()
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
                    collector.on('collect', async interaction => {
                        if (interaction.user.id !== message.author.id) {
                            return interaction.reply({ content: "You are not authorized to use this button.", ephemeral: true });
                        }
                        if (interaction.customId === 'confirm') {
                            confirm.setDisabled(true)
                            cancel.setDisabled(true)
                            confirmMSG.delete()
                            message.channel.send('Goodbye channel removed')
                            goodbyeData.goodbyeChannel = "";
                            await database.saveServer(serverID ,goodbyeData) 
                        }
                        else if(interaction.customId == 'cancel') {
                            confirm.setDisabled(true);
                            cancel.setDisabled(true);
                            confirmMSG.delete()
                            message.channel.send('Goodbye channel not removed')

                        }
                        collector.stop()
                    })
                   collector.on('end', async interaction => {
                       confirm.setDisabled(true)
                       cancel.setDisabled(true)
                   })
                    
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
                    const collector = confirmMSG.createMessageComponentCollector()

                    collector.on('collect', async interaction => {
                        if (interaction.user.id !== message.author.id) {
                            return interaction.reply({ content: "You are not authorized to use this button.", ephemeral: true });
                        }
                        if (interaction.customId === 'confirm') {
                            isClicked = true;
                            confirm.setDisabled(true)
                            cancel.setDisabled(true)
                            confirmMSG.delete()
                            message.channel.send('Goodbye message removed')
                            goodbyeData.goodbyeMessage = "";
                            await database.saveServer(serverID ,goodbyeData) 
                        }
                        else if(interaction.customId == 'cancel') {
                            confirm.setDisabled(true);
                            cancel.setDisabled(true);
                            confirmMSG.delete()
                            message.channel.send('Goodbye message not removed')

                        }
                        collector.stop()
                    })
                    collector.on('end', async interaction => {
                       confirm.setDisabled(true)
                       cancel.setDisabled(true)
                   })
                    return;
                 } else {
                    goodbyeData.goodbyeMessage = messageArgs;
                    database.saveServer(serverID, goodbyeData)
                    message.channel.send(`Goodbye message updated to **${messageArgs}**`);
                }
                break
        }
        
        cooldown.has(cooldowns, message.author.id, message)
    }
}