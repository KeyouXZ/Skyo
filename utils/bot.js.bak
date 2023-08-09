const sqlite3 = require("sqlite3").verbose();
const chalk = require("chalk");
const db = new sqlite3.Database(`./database/users.sqlite`);
const globalDB = new sqlite3.Database(`./database/globals.sqlite`)
const timestamp = new Date().toLocaleString("en-US", { hour12: false }).replace(",", "");

const cooldown = {
  set: function (cooldowns, userId, cooldownSeconds) {
    const data = new Promise((resolve) => {
      db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err, row) => {
        resolve(row);
      });
    });
    let cooldownAmount = cooldownSeconds * 1000;
    if (data.isPremium == 1) {
      cooldownAmount -= cooldownAmount * 0.35;
    }
    cooldowns.set(userId, Date.now() + cooldownAmount);
  },
  has: function (cooldowns, userId, message) {
    const expirationTime = cooldowns.get(userId) || 0;
    if (Date.now() < expirationTime) {
      const timeLeft = (expirationTime - Date.now()) / 1000;
      return message.channel.send(`**⏱ | <@${userId}>**! Please wait and try the command again **in ${timeLeft.toFixed()} seconds**`)
      .then((msg) => {
        setTimeout(() => {
          msg.delete();
        }, timeLeft.toFixed() * 1000);
      });
    }
  },
};

const database = {
  createUser: async function (userId) {
    const newUser = {
      id: userId,
      createAt: new Date().toLocaleString("en-US", { hour12: false }).replace(",", ""),
      blacklist: 0, // false
      isPremium: 0, // false
      isDeveloper: 0, // false
      premiumDate: null, // null
      premiumDuration: null, // null
      xp: 0, // 0
      level: 1, // 1
      wallet: 100,
      bank: 0,
      lastDaily: null,
      lastWeekly: null,
    };
  const sql = `INSERT INTO users (id, createAt, blacklist, isPremium, isDeveloper, premiumDate, premiumDuration, xp, level, wallet, bank, lastDaily, lastWeekly) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    newUser.id,
    newUser.createAt,
    newUser.blacklist,
    newUser.isPremium,
    newUser.isDeveloper,
    newUser.premiumDate,
    newUser.premiumDuration,
    newUser.xp,
    newUser.level,
    newUser.wallet,
    newUser.bank,
    newUser.lastDaily,
    newUser.lastWeekly,
  ];
  await db.run(sql, values, function (err) {
    console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `New user with ID ${newUser.id} inserted.`);
  });
  },
  get: function (query, userId) {
    return new Promise((resolve) => {
      db.get(`SELECT * FROM ${query} WHERE id = ?`, [userId], (err, row) => {
        resolve(row);
      });
    });
  },
  getAll: function (query) {
    return new Promise((resolve) => {
      db.all(`SELECT * FROM ${query}`, (err, row) => {
        resolve(row);
      });
    });
  },
  run: function (query, params = []) {
    return new Promise((resolve, reject) => {
      db.run(query, params, function (err) {
        resolve(this);
      });
    });
  },
  getGlobalAll: function () {
    return new Promise((resolve) => {
      globalDB.all(`SELECT * FROM ${query}`, (err, row) => {
        resolve(row);
      });
    });
  }
};

const readline = {
  create: function (client) {
    const readline = require("readline");
    const chalk = require("chalk");

    const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ": ",
    });

    let sigintCount = 0;

    rl.on("SIGINT", () => {
      sigintCount++;
      if (sigintCount === 1) {
        console.log("Are you sure you want to exit? Press CTRL-C again to confirm.");
          setTimeout(() => {
            sigintCount = 0;
          }, 3000);
      } else {
        console.log("Exiting...");
        rl.close();
        client.destroy();
        process.exit(1);
      }
    });

    rl.on("line", (input) => {
      if (input !== "help" && input !== "user" && input !== "guild" && input !== "system" && input !== "reload" && input !== "exit") {
        console.log(chalk.red.bold(`Invalid command ${input}. Type help for all commands!`));
      }
      if (input == "help") {
        console.log(chalk.yellow(`Commands\nhelp, user, guild, system, reload, exit`));
      }
      if (input == "user") {
        console.log(`Users count:`,chalk.yellow.bold(client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)));
      }
      if (input == "guild") {
        console.log(`Guilds count:`, chalk.yellow.bold(client.guilds.cache.size));
      }
      if (input == "system") {
        console.log("Node:", chalk.yellow(process.version), "\nDevice:", chalk.yellow(process.platform, process.arch), "\nMemory:", chalk.yellow((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)), "MB\nRSS:", chalk.yellow((process.memoryUsage().rss / 1024 / 1024).toFixed(2)), `MB`);
      }
      if (input === "reload") {
        client.destroy();
        client.login(process.env.TOKEN);
        console.log("Client reloaded!");
      }
      if (input === "exit") {
        console.log("Received exit command, Shutting Down...");
        rl.close();
        client.destroy();
        process.exit(1);
      }
      if (input === "test") {
        const msg = "Client executed:";
        console.log(chalk.hex("#CD00CD")(`${msg} exit.`));
        console.log(chalk.blue.bgRed.bold("Hello world!"));
      }
    });
  },
};

module.exports = {
    cooldown,
    database,
    readline
};
