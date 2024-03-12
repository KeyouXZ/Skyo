module.exports = {
	name: 'cmd',
	description: "Check bot's ping.",
	dev: true,
	run: async (client, message, args, bot) => {
		const arg1 = args.slice(0).join(' ');
		if (!arg1) return bot.util.tempMessage(message, "Please provide command")

		const util = require('node:util');
        const exec = util.promisify(require('node:child_process').exec);

		try {
	        const { stdout, stderr } = await exec(arg1);
			let response = ( stderr || stdout )
			if (response.length > 1950) { 
				await message.channel.send(`\`\`\`\n${response.slice(0, 1950)}\`\`\``)
				await message.channel.send(`\`\`\`\n${response.slice(1951, 3902)}\`\`\``)
				if (response.length > 3902) {
				    return message.channel.send("Message is too long.")
				}
				return
			} else {
			    return message.channel.send(`\`\`\`\n${response}\`\`\``);
			}
		} catch (e) {
			return message.reply(`\`\`\`\n${e}\`\`\``)
		}
	}
};