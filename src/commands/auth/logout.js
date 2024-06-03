const path = require("path");

function getAnswers (a,b,c) {
    switch (c) {
        case "+":
            return a + b
        case "-":
            return a - b
        case "x":
            return a * b
    }
}

module.exports = {
    name: 'logout',
    description: "Logout from an account",
    cooldown: 10,
    run: async (client, message, args, bot) => {
        if (bot.cooldown.has(client, message)) return;
        const user = message.author;

        if (!client.auth.has(user.id)) return user.send("You are not logged in")

        const math1 = Math.floor(Math.random() * 5)
        const math2 = Math.floor(Math.random() * 5)
        const oper = ["+", "-", "x"][Math.floor(Math.random() * 3)]

        user.send("Do you really want to logout?")
        user.send(`Solve this math to confirm\n\`\`\`${math1} ${oper} ${math2}\`\`\``)

        client.state.set(user.id, "logout")
        client.tmp[1].set(user.id, getAnswers(math1, math2, oper))
        client.tmp[2].set(user.id, 3)
        
        bot.cooldown.set(client, message);
    }
}