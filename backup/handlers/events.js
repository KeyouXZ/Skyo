const fs = require("fs");
const chalk = require('chalk');

module.exports = (client) => {
    const timestamp = new Date().toLocaleString('en-US', { hour12: false }).replace(',', '');
    console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `Loading events...`);
  
    let loadedEvents = 0;
    fs.readdirSync('./src/events/').filter((files) => files.endsWith('.js')).forEach((event) => {
        try {
            require(`../events/${event}`);
            loadedEvents++;
        } catch (error) {
            console.log(chalk.gray(`[${timestamp}]`), chalk.red.bold(`ERROR Unable to load file ${event.replace('.js', '')}: ${error.message} ${error.stack}`));
            process.exit(1);
        }
    });

    console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), chalk.yellow.bold(loadedEvents), 'events loaded');
};