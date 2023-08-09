const fs = require("fs");
const chalk = require('chalk');
const { REST, Routes, PermissionsBitField } = require('discord.js');

/*
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const rest = new REST({ version: '9' }).setToken(TOKEN);
*/
module.exports = (client) => {
/*
const timestamp = new Date().toLocaleString('en-US', { hour12: false }).replace(',', '');
  console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `Loading slash commands...`)
  const slashCommands = [];
  
  fs.readdirSync('./src/slashCommands/').forEach(async dir => {
    const files = fs.readdirSync(`./src/slashCommands/${dir}/`).filter(file => file.endsWith('.js'));

    for (const file of files) {
      const slashCommand = require(`../slashCommands/${dir}/${file}`);
      if (slashCommand.name) {
      slashCommands.push({
        name: slashCommand.name,
        description: slashCommand.description,
        type: slashCommand.type,
        options: slashCommand.options ? slashCommand.options : null,
        default_permission: slashCommand.default_permission ? slashCommand.default_permission : null,
        default_member_permissions: slashCommand.default_member_permissions ? PermissionsBitField.resolve(slashCommand.default_member_permissions).toString() : null
      });

      client.slashCommands.set(slashCommand.name, slashCommand)
      } else {
        console.log(chalk.gray(`[${timestamp}]`), chalk.red.bold(`ERROR Unable to load ${file.replace('.js', '')} slash command from ${dir}`))
      }
    }
  });

  (async () => {
    try {
      await rest.put(
        process.env.GUILD_ID ?
          Routes.applicationGuildCommands(CLIENT_ID, process.env.GUILD_ID) :
          Routes.applicationCommands(CLIENT_ID),
        { body: slashCommands }
      );
      console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `Slash Commands Registered`)
    } catch (error) {
      console.log(chalk.gray(`[${timestamp}]`), chalk.red.bold(`ERROR ${error}`))
    }
  })();
  console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), chalk.yellow.bold(client.slashCommands.size), 'slash commands loaded')
  */
};
