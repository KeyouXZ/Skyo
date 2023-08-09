const { EmbedBuilder, Collection } = require('discord.js');
const ms = require('ms');
const client = require('../../index.js');
const config = require('../../utils/config');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const chalk = require('chalk');
const mPrefix = process.env.CPREFIX;
const sqlite3 = require('sqlite3').verbose();
const { database } = require('../../utils/bot');

const prefixes = client.prefix;
const cooldown = new Collection();
const premium = new Collection();
const developer = new Collection();
const cd = new Collection();

const timestamp = new Date().toLocaleString('en-US', { hour12: false }).replace(',', '');
console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `Connecting to SQLite database...`);

// Create a new SQLite database connection
const db = new sqlite3.Database(`./database/users.sqlite`, () => {
    console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `Connected to SQLite database.`);
});

// Execute the database schema to create necessary tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    createAt TEXT,
    blacklist INTEGER,
    isPremium INTEGER,
    isDeveloper INTEGER,
    premiumDate INTEGER,
    premiumDuration INTEGER,
    xp NUMERIC,
    level NUMERIC,
    wallet NUMERIC,
    bank NUMERIC,
    lastDaily TEXT,
    lastWeekly TEXT
  );
`
);

/*db.exec(`
  CREATE TABLE IF NOT EXISTS globalItems (
  id NUMERIC PRIMARY KEY NOT NULL,
  name TEXT,
  description TEXT,
  type NUMERIC,
  rarity NUMERIC,
  buyAble INTEGER,
  sellAble INTEGER,
  price NUMERIC
  );
`
);
*/
client.on('messageCreate', async (message) => {
    // Levels
    if (message.author.bot) return;
    
    const lData = await database.get('users', message.author.id);

    if (lData && lData.blacklist === 0) {
      const xpAmount = Math.floor(Math.random() * 10) + 15;
      const userLevel = lData.level;
      const newXp = lData.xp + xpAmount;
      const levelUp = Math.floor(0.1 * Math.sqrt(newXp));

      if (userLevel < levelUp) {
        db.run('UPDATE users SET xp = ?, level = ? WHERE id = ?', [newXp, levelUp, message.author.id], (err) => {
          if (err) {
            console.error(err.message);
          } else {
            const levelUpEmbed = new EmbedBuilder()
              .setColor('Random')
              .setTitle(`${message.author.username}, you've leveled up to level ${levelUp}!`)
              .setDescription(`Congratulations! Keep up the good work.`);
            message.channel.send({ embeds: [levelUpEmbed] });
          }
        });
      }
    }
  // Levels

  if (message.channel.type !== 0) return;
  const prefix = prefixes.find(p => message.content.startsWith(p));
  if (!prefix) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();
  if (cmd.length == 0) return;
  let command = client.commands.get(cmd);
  if (!command) command = client.commands.get(client.aliases.get(cmd));
  
  if (!command?.run) return;
  
    const firstData = await database.get('users', message.author.id);
  
  if (!firstData) {
        await database.createUser(message.author.id);
    }
  
  const targetMember = message.mentions.members.first();
    if (targetMember && !targetMember.user.bot) {
        const targetData = await database.get('users', message.mentions.members.first().user.id);
        if (!targetData) {
            await createUser(message.mentions.members.first().user.id);
        }
    }
    
    const data = await database.get('users', message.author.id);
  
  if (data.blacklist == 1) {
    return message.reply(`You are blacklisted from this bot and you can't use this bot while on the blacklist`);
  }

  
  // USER PREMIUM SYSTEM
  if (data.isPremium == 1) {
  if (data.premiumDate) {
    const expirationDate = moment(data.premiumDate).add(data.premiumDuration, 'days');
    const currentDate = moment();
    if (currentDate > expirationDate) {
      const sql = 'UPDATE users SET isPremium = ?, premiumDate = ?, premiumDuration = ? WHERE id = ?';
      const values = [0, null, null, message.author.id];
      db.run(sql, values, function() {
          console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `Premium expired for ${message.author.tag} with id ${message.author.id}`);
          message.channel.send(`${message.author.username}! Your premium has been used up. Please renew your premium subscription to continue to enjoy premium features`);
      });
    }
  }
}

  // USER PREMIUM SYSTEM END 
  
  // Additional Code Place

  // PREMIUM USER CODE 
  if (command) {
    if (!premium.has(command.name)) {
      premium.set(command.name, new Collection());
    }
    if (command.premium && data.isPremium == 0) {
      const premiumEmbed = new EmbedBuilder()
        .setColor('Yellow')
        .setTitle('You need premium features')
        .setDescription(`${command.name} is only available for premium users\nTo buy this feature you can buy it through the official Discord server by typing ${prefix}premium`);
      return message.reply({ embeds: [premiumEmbed] });
    }
  }
  // PREMIUM USER CODE END

  // DEVELOPER USER 
  if (command) {
    if (!developer.has(command.name)) {
      developer.set(command.name, new Collection());
    }
    if (command.developer && data.isDeveloper == 0) {
      return;
      //
    }
  }
  // DEVELOPER USER END 
  
  // COOLDOWNS CODE
  if (command && command.cd) {
    if (!cooldown.has(command.name)) {
      cooldown.set(command.name, new Collection());
    }
    const current_time = Date.now();
    const time_stamps = cooldown.get(command.name);
    let cooldown_amount = (command.cooldown) * 1000;
    
    if (data.isPremium == 1) {
      cooldown_amount -= cooldown_amount * 0.35;
    }

    if (time_stamps.has(message.author.id)) {
      const expiration_time = time_stamps.get(message.author.id) + cooldown_amount;
      if (current_time < expiration_time) {
        const time_left = (expiration_time - current_time) / 1000;
        
        const cooldownMessage = `**⏱ | ${message.author.username}**! Please wait and try the command again **in ${time_left.toFixed()} seconds**`;
        return message.channel.send(cooldownMessage).then(msg => {
          setTimeout(() => {
            msg.delete();
          }, cooldown_amount);
        });
        //
      }
    }

    time_stamps.set(message.author.id, current_time);

    setTimeout(() => time_stamps.delete(message.author.id), cooldown_amount);
  }
  // COOLDOWNS CODE END 

  command.run(client, message, args);
});