const { ActivityType } = require('discord.js');
const client = require('../index');
const chalk = require("chalk");
const { config } = require("../../utils/bot")

client.on("ready", () => {
	config.set(client)
    const timestamp = new Date().toLocaleString('en-US', { hour12: false }).replace(',', '');
	const activities = [
		{ name: `${client.guilds.cache.size} Servers`, type: ActivityType.Listening },
		{ name: `${client.channels.cache.size} Channels`, type: ActivityType.Playing },
		{ name: `${client.users.cache.size} Users`, type: ActivityType.Watching }
	];
	const status = [
		'online'
	];
	let i = 0;
	setInterval(() => {
		if(i >= activities.length) i = 0;
		client.user.setActivity(activities[i]);
		i++;
	}, 5000);

	let s = 0;
	setInterval(() => {
		if(s >= activities.length) s = 0;
		client.user.setStatus(status[s]);
		s++;
	}, 30000);
    console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `Connected to`, chalk.yellow(client.user.tag));
});