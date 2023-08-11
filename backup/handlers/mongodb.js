const mongoose = require('mongoose');
const chalk = require('chalk');
const url = process.env.MONGO;

module.exports = async (client) => {
    const timestamp = new Date().toLocaleString('en-US', { hour12: false }).replace(',', '');
    console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `Loading mongodb...`);
    mongoose.set('strictQuery', false);
    try {
        console.log(chalk.blue(chalk.bold(`Database`)), (chalk.white(`>>`)), chalk.red(`MongoDB`), chalk.green(`is connecting...`))
        console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `Connecting to mongodb...`);
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (err) {
        console.log(chalk.gray(`[${timestamp}]`), chalk.red.bold(`ERROR Failed to connect to MongoDB: ${err.msg} ${err.stack}`));
        process.exit(1)
    }

    mongoose.connection.once("open", () => {
        console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `Connected to MongoDB`);
    });

    mongoose.connection.on("error", (err) => {
        console.log(chalk.gray(`[${timestamp}]`), chalk.red.bold(`ERROR Failed to connect to MongoDB: ${err.msg} ${err.stack}`));
        process.exit(1)
    });
    return;
}