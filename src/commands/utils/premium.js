const { EmbedBuilder } = require("discord.js");
const { database, config } = require("../../../utils/bot");
const moment = require("moment");

module.exports = {
    name: "premium",
    description: "Premium Information.",
    cooldown: 10,
    cd: true,
    run: async (client, message, args) => {
        const data1 = await database.getItem("1")
        const data2 = await database.getItem("2")
        const data3 = await database.getItem("3")
        const data4 = await database.getItem("4")

        const infoEmbed = new EmbedBuilder()
            .setColor("Yellow")
            .setTitle("Premium Information")
            .addFields([
                {
                    name: "Price",
                    value: `1 Month = $${data1.price / 310}\n2 Month = $${data2.price / 310}\n3 Month = $${data3.price / 310}\n1 Year = $${data4.price / 310}`,
                },
                {
                    name: "Premium Features",
                    value: "- Reduces cooldown when using command by 35%\n- Reducing fee when transferring money to other people by 50%\n- Add money income by 7%-10%",
                },
                {
                    name: "Payment",
                    value: `For now payment only supports PayPal\n\nWant to buy premium features? You can buy this by DM <@${config.developer}> or open a ticket on our official Discord server.`,
                },
            ]);
        await message.channel.send({ embeds: [infoEmbed] });
    },
};
