const { EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
    name: "help",
    description: "Get the bot commands",
    cooldown: 10,
    run: async (client, message, args, bot) => {
        if (bot.cooldown.has(client, message)) return

        if (args[0]) {
            const cmd = args.shift().toLowerCase();
            if (cmd.length == 0) return;
            command = client.commands.get(cmd);
            if (!command) command = client.commands.get(client.aliases.get(cmd));
            if (!command) return message.channel.send("Command not found")

            const document = {}
            const description = command?.description
        
            document["Name"] = command.name
        
            if (description) {
                document["Description"] = description
            }
            
            const aliases = command?.aliases
            if (aliases) {
                if (Array.isArray(aliases) && aliases.length > 0) {
                    document["Aliases"] = aliases.join(", ")
                } else {
                    document["Alias"] = aliases
                }
            }
            
            const usage = command?.usage
            if (usage) {
                if (Array.isArray(usage) && usage.length > 0) {
                    let __usage = ""
                    usage.filter(i => {
                        __usage += client.prefix[0] + command.name + " "  + i+"\n"
                    })
                    document["Usage"] = __usage
                } else {
                    document["Usage"] = client.prefix[0] + command.name + " " + usage
                }
            }
            
            const cooldown = command?.cooldown
            if (cooldown) {
                document["Cooldown"] = cooldown + " Seconds"
            }
        
            const premium = command?.premium
            if (premium) {
                document["Premium"] = premium
            }

            // Creating embed
            const embed = new EmbedBuilder()
                .setTitle(`Document of ${command.name}`)
                .setColor('Green');

            for (const key in document) {
                embed.addFields({ name: key, value: document[key] })
            }

            message.channel.send({ embeds: [embed] })
            return bot.cooldown.set(client, message);
        }
        
        // Utility
        let commandHelp = { "listDir": [] };
        const commandPath = "./src/commands/"
        fs.readdirSync(commandPath).forEach(dir => {
            // Dir
            commandHelp["listDir"].push(dir)
            
            commandHelp[dir] = [];
            
            fs.readdirSync(commandPath + dir).filter(file => file.endsWith(".js")).forEach(file => {
                const commandName = client.commands.get(file.replace(".js", ""))?.name;
                if (!commandName) {
                    return;
                } else if (file.replace(".js", "") == commandName) {
                    commandHelp[dir].push(commandName);
                }
            })
        })
        
        
        const embed = new EmbedBuilder()
            .setTitle("Command List")
            .setDescription(
                `Here is the list of commands!\nFor more info on a specific command, use \`${client.prefix[0]}cmdhelp <command/aliase>\`\nNeed more help? Come join our [guild](https://discord.com/invite/n9qS6CWqqg)`
            )
            .setColor("Blue")
            .setTimestamp();
           
        // List commands
        commandHelp["listDir"].forEach(i => {
            // Filter Developers
            if (i != "auth" && i != "economy" && i != "fun" && i != "leaderboard" && i != "moderation" && i != "other" && i != "utility") return;
            
            // Add emojies
            const emojies = {
                "auth": "⚙️",
                "economy": "💰",
                "fun": "😂",
                "leaderboard": "🥇",
                "moderation": "🛡️",
                "other": "🔍",
                "utility": "🔧"
            }
            
            // Make first letter to upper case
            let name = i[0].toUpperCase() + i.slice(1);
            
            if (emojies[i]) {
                name = emojies[i] + " " + name;
            }
            
            embed.addFields({
                name: name,
                value: commandHelp[i].join(", ")
                })
        })
        
        await message.channel.send({ embeds: [embed] });
        return bot.cooldown.set(client, message)
    },
};
