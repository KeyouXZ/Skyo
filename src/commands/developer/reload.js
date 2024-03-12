const fs = require("fs");
const path = require("path")
const chalk = require('chalk');
const timestamp = new Date().toLocaleString('en-US', { hour12: false }).replace(',', '');

module.exports = {
    name: "reload",
    isDev: true,
    run: async (client, message, args, bot) => {
        // Reloading commands
        reloadMsg = await message.channel.send("Reloading commands...")
        console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `Reloading commands...`);
    
        fs.readdirSync('./src/commands/').forEach(dir => {
            const files = fs.readdirSync(`./src/commands/${dir}/`).filter(file => file.endsWith('.js'));
            files.forEach((file) => {
                //  Delete require first
                filePath = path.resolve(`./src/commands/${dir}/${file}`);
                delete require.cache[require.resolve(filePath)];

                let command = require(`../${dir}/${file}`);
                if (command) {
                    // Delete commands before
                    client.commands.delete(command.name)
                    // Set new commands
                    client.commands.set(command.name, command);
                    if (command.aliases && Array.isArray(command.aliases)) {
                        command.aliases.forEach(alias => {
                            // Delete aliases
                            client.aliases.delete(alias);
                            // Set aliases
                            client.aliases.set(alias, command.name);
                        });
                    }
                    // 
                }
            });
        });
        
        // Send message to author
        await reloadMsg.edit(`**${client.commands.size}** commands reloaded`)
        console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), chalk.yellow.bold(client.commands.size), 'commands reloaded');
    }
}