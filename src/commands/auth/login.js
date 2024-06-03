const path = require("path");
const fs = require("fs")

module.exports = {
    name: 'login',
    description: "Login to an account",
    cooldown: 10,
    usage: "<name> <password>",
    run: async (client, message, args, bot) => {
        if (bot.cooldown.has(client, message)) return;

        const user = message.author;
        
        // Check if already login
        if (client.auth.has(user.id)) return user.send("You are already login")

        const name = args[0]
        const password = args[1];
        
        // Check user input
        if (!name) {
            return user.send("Name cannot be empty");
        } else if (!password) {
            return user.send("Password cannot be empty");
        }
        
        // Check if the user exists
        const account = await bot.database.get(name);
        if (!account) {
            return user.send("User does not exist");
        } else if (password !== account.password) {
            return user.send("Password is incorrect");
        }
        
        const accountFormat = {
            ID: account.ID,
            name: account.name,
            username: account.username,
            password: account.password
        };
        
        client.auth.set(user.id, accountFormat);
        await user.send("Successfully logged in as " + name);

        // Save login credentials to file
        const userFilePath = path.join(__dirname, "..", "..", "..", ".data", "user.json");
        const data = JSON.parse(fs.readFileSync(userFilePath, "utf-8"))
        data[user.id] = accountFormat;
        fs.writeFileSync(userFilePath, JSON.stringify(data, null, 4));

        bot.cooldown.set(client, message);
    }
};
