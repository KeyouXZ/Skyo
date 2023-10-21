const { EmbedBuilder } = require("discord.js");
const { database, cooldown, config, util } = require("../../../utils/bot")
// Cooldowns
const { Collection } = require("discord.js");
const cooldowns = new Collection();

module.exports = {
    name: "reactionrole",
    description: "Recation role command.",
    usage: ["add <messageid> <emoji> <@&role>", "del <messageid> <@&role>"],
    cooldown: 10,
    userPerms: ["ManageMessages", "ManageRoles"],
    run: async (client, message, args) => {
        if (cooldown.has(cooldowns, message)) return
        
        if (!args[0]) return util.tempMessage(message, "Please specify options \"add\" or \"del\"")
        
        const data = await database.getServer(message.guild.id)
        switch (args[0]) {
            case "add":
                const msgID = args[1]
                if (!msgID) {
                    return util.tempMessage(message, "Please specify message ID")
                } else if (isNaN(parseInt(msgID))) {
                    return util.tempMessage(message, "Invalid message ID")
                }
                
                const channelID = message.mentions.channels.first()?.id
                try {
                    if (channelID) {
                        var fetchMsgID = await client.channels.fetch(channelID).then(channel => {
                                    return channel.messages.fetch(msgID);
                        })
                    }
                    var fetchMsgID = await message.channel.messages.fetch(msgID)
                    if (!fetchMsgID) return util.tempMessage(message, "Can't find message with that ID on this channel")
                } catch (err) {
                    return util.tempMessage(message, "Can't find message with that ID on this channel")
                }
                
                const emoji = args[2]
                const emojiPattern = /[\uD83C-\uDBFF\uDC00-\uDFFF\uD83D\uDC00-\uDE4F\uD83D\uDE80-\uDEFF\u2700-\u27BF\u2300-\u23FF\u2B50\u2600-\u26FF\u20D0-\u20FF]+/g;
                if (!emoji) {
                    return util.tempMessage(message, "Please specify emoji")
                } else if (!emojiPattern.test(emoji)) {
                    return util.tempMessage(message, "Invalid emoji")
                }
                
                const role = message.mentions.roles.first()
                if (!role) {
                    return util.tempMessage(message, "Please mention role")
                }
                
                const conflictingRR = data.reactionrole.find(rr => rr.messageID === msgID && (rr.emoji === emoji || rr.role === role.id));
                if (conflictingRR) {
                    return util.tempMessage(message, "A reaction role with the same message ID or role already exists with a different emoji.");
                }
                
                const newRR = {
                    messageID: msgID,
                    channelID,
                    emoji,
                    role: role.id
                }
                
                data.reactionrole.push(newRR)
                await database.saveServer(message.guild.id, data)
                fetchMsgID.react(emoji)
                message.channel.send(`Added ${emoji} with role <@&${role.id}>`)
                break
            
            case "del":
                if (!msgID) {
                    return util.tempMessage(message, "Please specify message ID");
                } else if (isNaN(parseInt(msgID))) {
                    return util.tempMessage(message, "Invalid messsage ID");
                }
            
                if (!role) {
                    return util.tempMessage(message, "Please mention role");
                }
            
                try {
                    var fetchMsgID = await message.channel.messages.fetch(msgID);
                    if (!fetchMsgID) return util.tempMessage(message, "Cannot find messages with that ID on this channel");
                } catch (err) {
                    return util.tempMessage(message, "Cannot find messages with that ID on this channel");
                }
                
                const matchingRRIndex = data.reactionrole.findIndex(rr => rr.messageID === msgID && rr.role === role.id);
            
                if (matchingRRIndex !== -1) {
                    const emoji = data.reactionrole[matchingRRIndex].emoji;
            
                    const reaction = fetchMsgID.reactions.cache.find(r => r.emoji.name === emoji);
            
                    if (reaction) {
                        reaction.users.remove(client.user.id).catch(console.error);
            
                        data.reactionrole.splice(matchingRRIndex, 1);
            
                        await database.saveServer(message.guild.id, data);
            
                        message.channel.send(`Deleted reaction role with id ${msgID} and role ${role}`);
                    } else {
                        return util.tempMessage(message, "Error while finding reaction role");
                    }
                } else {
                    return util.tempMessage(message, "There are no matching reaction role entries for the specified message ID and role");
                }
                break;
                            
            case "list":
                const listEmbed = new EmbedBuilder()
                .setTitle("Reaction Role List")
                .setColor("Random");
                
                let num = 0
                await data.reactionrole.find(c => {
                    num++;
                    listEmbed.addFields({
                        name: num,
                        value: `Message ID: ${c.messageID}\nEmoji: ${c.emoji}\nRole: <@&${c.role}>`
                    })
                })
                message.channel.send({ embeds: [listEmbed]})
                break
        }
    }
}