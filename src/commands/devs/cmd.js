const { util } = require('../../../utils/bot')
const utils = util;

module.exports = {
	name: 'cmd',
	description: "Check bot's ping.",
	dev: true,
	run: async (client, message, args) => {
		const arg1 = args.slice(0).join(' ');
		if (!arg1) return utils.tempMessage(message, "Please provide command")

		const util = require('node:util');
        const exec = util.promisify(require('node:child_process').exec);

		try {
	        const { stdout, stderr } = await exec(arg1);
			let response = ( stderr || stdout )
			if (response.length >= 1990) { 
				return message.reply(`\`\`\`\n${response.slice(0, 1900)}\`\`\``) 
			} else {
			    return message.channel.send(`\`\`\`\n${response}\`\`\``);
			}
		} catch (e) {
			return message.reply(`\`\`\`\n${e}\`\`\``)
		}
	}
};