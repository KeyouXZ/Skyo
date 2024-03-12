module.exports = {
    name: 'login',
    description: "Login to an account",
    cooldown: 10,
    run: async (client, message, args, bot) => {
        if (bot.cooldown.has(client, message)) return;

        const user = message.author;
        
        // Check if already login
        if (client.auth.has(user.id)) return user.send("You are already login")

        const name = args[0]?.toLowerCase();
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
        bot.cooldown.set(client, message);
    }
};
