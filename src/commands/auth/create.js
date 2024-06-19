const { userSchema } = require("../../../database/user");
const { EmbedBuilder, WebhookClient } = require("discord.js");

module.exports = {
    name: 'create',
    description: "Create new account",
    cooldown: 60*3600,
    usage: "<name> <password> [username]",
    run: async (client, message, args, bot) => {
        if (bot.cooldown.has(client, message)) return;
        
        // Get last ID
        const data = await bot.database.getAll()
        
        const values = Object.values(data).map(item => item.ID);
        const lastId = Math.max(...values) || 1;
        
        // Read last id
        let ID = lastId + 1;
        let name = args[0]
        let password = args[1]
        let username = args[2] ? args[2] : name
        name = name?.toLowerCase()
        
        if (!name) {
            return bot.util.tempMessage(message, "Name cannot be empty")
        } else if (!password) {
            return bot.util.tempMessage(message, "Password cannot be empty")
        } else if (name || password) {
            if (await bot.database.get(name)) {
                return await bot.util.tempMessage(message, "Name already exists")
            } else if (name <= 5 && name >= 15) {
                return await bot.util.tempMessage(message, "Name must be 5-15 character")
            } else if (password <= 5 && password >= 15) {
                return await bot.util.tempMessage(message, "Password must be 5-15 character")
            }
        }
        
        try {
            const user = new userSchema({ ID, name, password, username });
            await user.save()
        } catch (err) {
            return message.reply("Error cannot create user: " + err)
        }
        
        // Send new user
        if (process.env.WEBHOOK_URL) {
            const webhook = new WebhookClient({
                url: process.env.WEBHOOK_URL,
            });
            
            const newUserEmbed = new EmbedBuilder()
            .setTitle("New User")
            .setColor("Random")
            .setDescription(`**User Information**\n\n**ID**: ${ID}\n**Username**: ${username}\n**Name**: ${name}\n**Password**: || ${password} ||`)
            
            webhook.send({ username: "Skyo Logger", embeds: [newUserEmbed]});
        }
        bot.logger.info(`User with ID %%${ID}%% has been created`)
        
        const embed = new EmbedBuilder()
            .setTitle("User Created")
            .setColor("Random")
            .setDescription(`**User Information**\n\n**ID**: ${ID}\n**Username**: ${username}\n**Name**: ${name}\n**Password**: || ${password} ||\n\nTo login to this account use:\n\`\`\`${client.prefix[0]} login ${name} ${password}\`\`\``)
        
        await message.channel.send({ embeds: [embed]})
        return bot.cooldown.set(client, message);
    }
}