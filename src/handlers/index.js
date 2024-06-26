const fs = require("fs");
const path = require("path")
const chalk = require('chalk');
// Required by slash commands
const { REST, Routes, PermissionsBitField } = require('discord.js');
const { logger } = require("../../utils/bot")
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const rest = new REST({ version: '9' }).setToken(TOKEN);
// Required by MongoDB
const mongoose = require("mongoose");
const url = process.env.MONGO_URL;

module.exports = async (client) => {
    // Load events
    logger.info(`Loading events...`)
  
    let loadedEvents = 0;
    fs.readdirSync('./src/events/').filter((files) => files.endsWith('.js')).forEach((event) => {
        try {
            require(`../events/${event}`);
            loadedEvents++;
        } catch (error) {
            logger.warn(`Unable to load ${event.replace('.js', '')}`)
            process.exit(1);
        }
    });

    logger.info(`%%${loadedEvents}%% events loaded`)
    
    // Load commands
    logger.info(`Loading commands...`)
  
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
    logger.info(`%%${client.commands.size}%% commands loaded`)
    
    // Load slashCommand
    logger.info(`Loading slash commands...`)
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
                logger.warn(`Unable to load ${file.replace('.js', '')} slash command from ${dir}`)
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
            logger.info(`Slash Commands Registered`)
        } catch (error) {
            logger.warn(`Failed to register slash commands: ${error.stack}`)
        }
    })();
    logger.info(`%%${client.slashCommands.size}%% slash commands loaded`)
    
    // Load MongoDB
    mongoose.set('strictQuery', false);
    try {
        logger.info(`Connecting to MongoDB...`)
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(c => {
             logger.info(`Connected to MongoDB`)
        });
    } catch (err) {
        logger.error(`Failed to connect to MongoDB: ${err.msg} ${err.stack}`)
        process.exit(1);
    }

	// Load HTTP Server
	const prettyMilliseconds = require("pretty-ms");
    logger.info("HTTP Server starting...")
	try {
	    const port = process.env.PORT || 3000
	    const server = require('http').createServer((req, res) => {
		    res.statusCode = 200;
		    res.setHeader('Content-Type', 'text/plain');
		    res.end(`<p>User: ${client.user?.tag}</p><hr><p>Uptime: ${prettyMilliseconds(client.uptime)}</p><p>Users: ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)}</p><p>Servers: ${client.guilds.cache.size}</p><hr>`);
	    });
	
	    server.listen(port, "0.0.0.0", () => {
            logger.info("HTTP Server running on port %%" + port + "%%")
	    });
    } catch (err) {
        logger.error("Failed to start HTTP Server: " + err.stack)
	}

    // Load logged users
    logger.info(`Loading logged users...`)
    const userFilePath = path.join(__dirname, "..", "..", ".data", "user.json");

    if (!fs.existsSync(userFilePath)) {
        fs.mkdirSync(path.dirname(userFilePath), { recursive: true });
        fs.writeFileSync(userFilePath, '{}');
    }

    const user = fs.readFileSync(userFilePath, "utf-8")
    for (const key in JSON.parse(user)) {
        client.auth.set(key, JSON.parse(user)[key]);
    }

    logger.info(`%%${Object.keys(JSON.parse(user)).length}%% logged users loaded`)
}
