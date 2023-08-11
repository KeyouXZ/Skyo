const fs = require("fs");
const chalk = require('chalk');
module.exports = (client) => {
    const timestamp = new Date().toLocaleString('en-US', { hour12: false }).replace(',', '');
    console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `Loading commands...`);
  
    fs.readdirSync('./src/commands/').forEach(dir => {
        const files = fs.readdirSync(`./src/commands/${dir}/`).filter(file => file.endsWith('.js'));
        files.forEach((file) => {
            let command = require(`../commands/${dir}/${file}`);
            if (command) {
                client.commands.set(command.name, command);
                if (command.aliases && Array.isArray(command.aliases)) {
                    command.aliases.forEach(alias => {
                        client.aliases.set(alias, command.name);
                    });
                }
                // 
            }
        });
    });
    console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), chalk.yellow.bold(client.commands.size), 'commands loaded');
};
