const { EmbedBuilder, Collection } = require('discord.js');
const ms = require('ms');
const client = require('../index.js');
const moment = require('moment');
const chalk = require('chalk');
const { cooldown, database, config, util } = require('../../utils/bot');

const prefixes = client.prefix;
const premium = new Collection();
const dev = new Collection();

const timestamp = new Date().toLocaleString('en-US', { hour12: false }).replace(',', '');

client.on('messageCreate', async (message) => {

    function getAuth(id) {
        const auth = client.auth.get(id);
        if (!auth) return undefined;

        return { ...auth, toString() { return auth.name}}
    }

    // Bot
    const bot = { cooldown, database, config, util, getAuth};

    // Levels
    
    if (message.author.bot) return;
    
    // Check if user is login or not and if login check password match
    const isLogin = client.auth.has(message.author.id);
    let auth;
    let name;
    let password;
    let data;
    
    if (isLogin) {
        auth = client.auth.get(message.author.id);
        name = auth.name;
        password = auth.password;
        data = await database.get(name);    

        if (password != data.password) {
            message.author.send("You have been logged out of your account, because your password is incorrect");
            client.auth.delete(message.author.id);
        } 
        
        // Level
        const lData = await database.get(name);
    
        if (lData && lData.blacklist === 0) {
            const xpAmount = Math.floor(Math.random() * 10) + 15;
            const userLevel = lData.level;
            const newXp = lData.xp + xpAmount;
            const levelUp = Math.floor(0.1 * Math.sqrt(newXp));
    
            if (userLevel < levelUp) {
                lData.xp += xpAmount;
                lData.level = levelUp;
                await database.save(name, lData);
                const levelUpEmbed = new EmbedBuilder()
                .setColor('Random')
                .setTitle(`${message.author.username}, you've leveled up to level ${levelUp}!`)
                .setDescription(`Congratulations! Keep up the good work.`);
                message.channel.send({ embeds: [levelUpEmbed] });
            }
        }
    }

    // User state
    const userState = client.state;
    if (userState.has(message.author.id)) {
        switch (userState.get(message.author.id)) {
            case ('logout'):
                require("./messageCreate/logout.js")(client, message);
        }
    }

    // Prefix
    const prefix = prefixes.find(p => message.content.startsWith(p));
    if (!prefix) return;
    
    // Args 
    const regex = /"([^"]*)"|\S+/g;
    const args = [];
    let match;

    while ((match = regex.exec(message.content.slice(prefix.length))) !== null) {
        args.push(match[1] || match[0]);
    }
    
    // Command 1
    const cmd = args.shift().toLowerCase();
    if (cmd.length == 0) return;
    let command = client.commands.get(cmd);
    if (!command) command = client.commands.get(client.aliases.get(cmd));
    if (!command?.run) return;
    
    // DM for specific commands 
    if (command.name == "login" || command.name == "create" || command.name == "logout") {
        if (message.channel.type == 1) { // 1 = DM
            return command.run(client, message, args, bot);
        } else {
            return message.reply("You can't use this command here!. Must be in DM");
        }
    } else if (message.channel.type == 1) {
        return message.author.send("You can't use this command here!.");
    }
    
    // Command 2
    if (message.channel.type !== 0) return
    
    // Command that require login
    const loginCommand = ["balance", "daily", "deposit", "pay", "shop", "use", "weekly", "withdraw"];
    if (loginCommand.includes(command.name) && !isLogin) {
        return message.reply("You must be logged in to use this command")
    }
    
    // Command perm
    if (command.userPerms) {
        const missingPerm = []
        command.userPerms.find(c => {
            if (!message.member.permissions.has(c)) {
                missingPerm.push(c)
            }
        })
        
        if (missingPerm.length > 0) {
            return message.reply(`You don't have the required permissions to use this command: ${missingPerm.join(', ')}`);
        }
    }
    
    // Server data
    const serverData = await database.getServer(message.member.guild.id)
    if (!serverData) await database.createServer(message)
    
    
    if (isLogin) {
        if (data.blacklist == 1) {
            return message.reply(`You are blacklisted from this bot and you can't use this bot while on the blacklist`);
        }
      
        // USER PREMIUM SYSTEM
        if (data.isPremium == 1) {
            if (data.premiumDate) {
                const expirationDate = moment(data.premiumDate).add(data.premiumDuration, 'days');
                const currentDate = moment();
                if (currentDate > expirationDate) {
                    data.isPremium = 0;
                    data.premiumDate = null;
                    data.premiumDuration = null;
                    await database.save(message.author.id, data);
                    console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `Premium expired for ${message.author.tag} with id ${message.author.id}`);
                    message.author.send(`${message.author.username}! Your premium has been used up. Please renew your premium subscription to continue to enjoy premium features`);
                }
            }
        }
    }
    
    // PREMIUM USER CODE 
    if (command) {
        // Embeds
        const premiumEmbed = new EmbedBuilder()
            .setColor('Yellow')
            .setTitle('You need premium features')
            .setDescription(`${command.name} is only available for premium users\nTo buy this feature you can buy it through the official Discord server by typing ${prefix}premium`);
            
            
        if (!premium.has(command.name)) {
            premium.set(command.name, new Collection());
        }
        if (command.premium && data?.isPremium == 0) {
            return message.reply({ embeds: [premiumEmbed] });
        }

    // DEVELOPER USER 
        if (!dev.has(command.name)) {
            dev.set(command.name, new Collection());
        }
        if (command.dev && data?.isDeveloper == false) {
            return;
        }
    }
    
    // Run command
    command.run(client, message, args, bot);
});
