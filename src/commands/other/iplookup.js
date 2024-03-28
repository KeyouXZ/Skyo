const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "iplookup",
    alias: "ilp",
    description: "Get IP Address information",
    usage: "<ipaddress>",
    premium: true,
    cooldown: 10,
    run: async (client, message, args, bot) => {
        if (bot.cooldown.has(client, message)) return;
        
        const ip = args[0];
        if (!ip) {
            return bot.tempMessage(message, "Please specify IP Adress")
        }
        
        const response = await fetch(`https://ipinfo.io/${ip}/json`)
        const data = await response.json()
        if (data["status"]) {
            bot.cooldown.set(client, message)
            return message.channel.send("Cannot find information about this IP Address")
        } else {
            const ipEmbed = new EmbedBuilder()
            .setTitle("IP Information")
            .setColor("Random")
            
            for (let i in data) {
                if (i == "readme") {
                    continue 
                } else if (i == "ip") {
                    const text = "**" + i[0].toUpperCase() + i[1].toUpperCase() + " Address**"
                    ipEmbed.addFields({
                        name: text.toLocaleString(),
                        value: data[i].toLocaleString()
                    })
                    continue
                }
                const text = i[0].toUpperCase() + i.slice(1, i.length)
                ipEmbed.addFields({
                    name: text.toLocaleString(),
                    value: data[i].toLocaleString()
                })
            }
            
            bot.cooldown.set(client, message)
            return await message.channel.send({ embeds: [ipEmbed] })
        }
        
    }
}