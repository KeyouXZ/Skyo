const { EmbedBuilder, Collection, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { database, cooldown, util } = require("../../../utils/bot");
const cooldowns = new Collection()

module.exports = {
    name: "welcome",
    description: "Welcome commands",
    usage: ["info", "wiki", "channel [#channel]", "message [message]", "enable <true/false>"],
    cooldown: 5,
    userPerms: ["ManageMessages"],
    run: async (client, message, args)  => {
        // Cooldowns 
        if (cooldown.has(cooldowns, message)) return;

        const serverID = message.member.guild.id;
        const welcomeData = await database.getServer(serverID);
        
        if (!args[0]) {
            return util.tempMessage(message, "Please select options wiki or info or channel or message")
        }

        if (args[0] !== 'wiki' && args[0] !== 'info' && args[0] !== 'channel' && args[0] !== 'message' && args[0] !== 'enable') {
            return util.tempMessage(message, 'Invalid option. Please choose either "wiki" or info" or "channel" or "message".')
        }
        
        if (args[0] == "enable") {
            if (args[1] == "true") {
                message.channel.send("Welcome has enabled")
                welcomeData.welcomeEnable = true
                return await database.saveServer(serverID, welcomeData)
            } else if (args[1] == "false") {
                message.channel.send("Welcome has disabled")
                welcomeData.welcomeEnable = false
                return await database.saveServer(serverID, welcomeData)
            } else {
                return util.tempMessage(message, "Invalid word " + args[1] + ". Please choose either \"true\" or \"false\"")
            }
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

        let confirmMSG = null;
        let isClicked = false;
        if ((args[0] == "channel" && !message.mentions.channels.first()) || (args[0] == 'message' && !args[1])) {
            confirmMSG = await message.reply({
                content: `Do you want to delete the welcome ${args[0]}?`,
                    components: [row]
            })
            var collector = confirmMSG.createMessageComponentCollector()

            setTimeout(() => {
                if (isClicked == false) {
                    confirm.setDisabled(true);
                    cancel.setDisabled(true);
                    confirmMSG.edit({ content: `Do you want to delete the welcome ${args[0]}? (Time Out)`, components: [row] });
                } else if (isClicked == true) return;
            }, 20000);
        }

        cooldown.set(cooldowns, message.author.id, module.exports.cooldown)
        
        switch (args[0]) {
            case "info":
                let iwc = `<#${welcomeData.welcomeChannel}> (${welcomeData.welcomeChannel})`;
                if (welcomeData.welcomeChannel == '') iwc = '-';
                let iwm = `_${welcomeData.welcomeMessage}_`;
                if (welcomeData.welcomeMessage == '') iwm = '-';
                let iws = welcomeData.welcomeEnable ? 'Enable' : 'Disable';
                let rwm = welcomeData.welcomeMessage
                .replace("{member}", `<@${message.author.id}>`)
		        .replace("{member(id)}", message.author.id)
		        .replace("{member(tag)}", message.author.tag)
		        .replace("{member(name)}", message.author.username)
		        .replace("{server}", message.guild.name)
		        .replace("{member(count)}", message.guild.memberCount);
                if (!rwm) rwm = '-';

                const infoEmbed = new EmbedBuilder()
                .setColor('Blue')
                .addFields(
                    { name: 'Welcome Channel', value: iwc },
                    { name: 'Welcome Message', value: iwm },
                    { name: 'Welcome Status', value: iws },
                    { name: 'Result', value: rwm}
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
                const channelID = message.mentions.channels.first()?.id
                if (!channelID) {
                    collector.on('collect', async interaction => {
                        if (interaction.user.id !== message.author.id) {
                            return interaction.reply({ content: "You are not authorized to use this button.", ephemeral: true });
                        }
                        if (interaction.customId === 'confirm') {
                            isClicked = true;
                            confirm.setDisabled(true)
                            cancel.setDisabled(true)
                            confirmMSG.delete()
                            message.channel.send('Welcome channel removed')
                            welcomeData.welcomeChannel = "";
                            await database.saveServer(serverID, welcomeData) 
                        }
                        else if(interaction.customId == 'cancel') {
                            confirm.setDisabled(true);
                            cancel.setDisabled(true);
                            confirmMSG.delete()
                            message.channel.send('Welcome channel not removed')
                        }
                        collector.stop()
                    })
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
                    collector.on('collect', async interaction => {
                        if (interaction.user.id !== message.author.id) {
                            return interaction.reply({ content: "You are not authorized to use this button.", ephemeral: true });
                        }
                        if (interaction.customId === 'confirm') {
                            isClicked = true;
                            confirm.setDisabled(true)
                            cancel.setDisabled(true)
                            confirmMSG.delete()
                            message.channel.send('Welcome message removed')
                            welcomeData.welcomeMessage = "";
                            await database.saveServer(serverID, welcomeData) 
                        }
                        else if(interaction.customId == 'cancel') {
                            confirm.setDisabled(true);
                            cancel.setDisabled(true);
                            confirmMSG.delete()
                            message.channel.send('Welcome message not removed')
                        }
                        collector.stop()
                    })
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