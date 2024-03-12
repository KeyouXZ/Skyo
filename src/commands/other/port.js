const { EmbedBuilder } = require("discord.js");
const net = require("net");

module.exports = {
    name: "port",
    description: "Checks if a port is open or closed.",
    aliases: ["pc"],
    cooldown: 10,
    usage: ["<ip address> <port>"],
    run: async (client, message, args, bot) => {
        if (bot.cooldown.has(client, message)) return

        const ipAddress = args[0];
        const port = parseInt(args[1]);

        if (!ipAddress || !port) {
            return bot.util.tempMessage(message, "You need to provide an IP address and a port number.")
        }

        const Sclient = new net.Socket();
        // Cooldowns
        bot.cooldown.set(client, message);

        Sclient.connect(port, ipAddress, () => {
            const embed = new EmbedBuilder()
                .setColor(`Green`)
                .setTitle(`Port ${port} on ${ipAddress}`)
                .setDescription("The port is open.")
                .setTimestamp();

            message.channel.send({ embeds: [embed] });

            Sclient.destroy();
        });

        Sclient.on("error", (error) => {
            const embed = new EmbedBuilder()
                .setColor("Red")
                .setTitle(`Port ${port} on ${ipAddress}`)
                .setDescription(
                    `The port is closed or could not be reached. Error: ${error.code}`
                )
                .setTimestamp();

            message.channel.send({ embeds: [embed] });

            Sclient.destroy();
        });
    },
};
