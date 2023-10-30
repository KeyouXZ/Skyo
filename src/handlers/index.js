const fs = require("fs");
const chalk = require('chalk');
// Required by slash commands
const { REST, Routes, PermissionsBitField } = require('discord.js');
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const rest = new REST({ version: '9' }).setToken(TOKEN);
// Required by MongoDB
const mongoose = require("mongoose");
const url = process.env.MONGO_URL;

module.exports = async (client) => {
    // Load events
    const timestamp = new Date().toLocaleString('en-US', { hour12: false }).replace(',', '');
    console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `Loading events...`);
  
    let loadedEvents = 0;
    fs.readdirSync('./src/events/').filter((files) => files.endsWith('.js')).forEach((event) => {
        try {
            require(`../events/${event}`);
            loadedEvents++;
        } catch (error) {
            console.log(chalk.gray(`[${timestamp}]`), chalk.red.bold(`ERROR Unable to load file ${event.replace('.js', '')}: ${error.message} ${error.stack}`));
            process.exit(1);
        }
    });

    console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), chalk.yellow.bold(loadedEvents), 'events loaded');
    
    // Load commands
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
    
    // Load slashCommand
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

                client.slashCommands.set(slashCommand.name, slashCommand);
            } else {
                console.log(chalk.gray(`[${timestamp}]`), chalk.red.bold(`ERROR Unable to load ${file.replace('.js', '')} slash command from ${dir}`));
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
    
    // Load MongoDB
    mongoose.set('strictQuery', false);
    try {
        console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `Connecting to MongoDB...`);
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(c => {
             console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `Connected to MongoDB`)
        });
    } catch (err) {
        console.log(chalk.gray(`[${timestamp}]`), chalk.red.bold(`ERROR Failed to connect to MongoDB: ${err.msg} ${err.stack}`));
        process.exit(1);
    }

	// Load HTTP Server
	const prettyMilliseconds = require("pretty-ms");
	console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `HTTP Server starting...`);
	try {
	    const port = process.env.PORT || 3000
	    const server = require('http').createServer((req, res) => {
		    res.statusCode = 200;
		    res.setHeader('Content-Type', 'text/plain');
		    res.end(`<p>User: ${client.user?.tag}</p><hr><p>Uptime: ${prettyMilliseconds(client.uptime)}</p><p>Users: ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)}</p><p>Servers: ${client.guilds.cache.size}</p><hr>`);
	    });
	
	    server.listen(port, "0.0.0.0", () => {
	        console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `HTTP Server running on port ${port}`)
	    });
    } catch (err) {
		console.log(chalk.gray(`[${timestamp}]`), chalk.red.bold(`ERROR Failed to start HTTP Server: ${err.msg} ${err.stack}`));
	}
}
