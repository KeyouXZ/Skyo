const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Collection,
} = require("discord.js");

module.exports = {
    name: "ban",
    description: "Ban a user from the server",
    usage: ["list", "<@member> [reason]"],
    cooldown: 10,
    userPerms: ["BanMembers"],
    run: async (client, message, args, bot) => {
        if (bot.cooldown.has(client, message)) return;

        if (args[0] == "list") {
            const bannedUsers = await message.guild.bans.fetch();
            if (bannedUsers.size === 0) {
                return message.channel.send(
                    "There are no banned users in this server"
                );
            }

            const embed = new EmbedBuilder()
                .setTitle(`List of banned users in ${message.guild.name}`)
                .setThumbnail(message.guild.iconURL({ dynamic: true }))
                .setColor("Random");

            bannedUsers.forEach((user) => {
                embed.addFields({
                    name: `${user.user.tag}`,
                    value: `User ID: ${user.user.id}\nReason: ${
                        user.reason ?? "Not specified"
                    }`,
                });
            });
            
            bot.cooldown.set(client, message);
            return message.channel.send({ embeds: [embed] });
        }

        const user = message.mentions.members.first();
        if (!user) {
            return bot.util.tempMessage(message, "You must mention a user to ban")
        }
        
        if (user.id === message.author.id) return message.reply(`You cannot ban yourself!`);
        if (message.member.roles.highest.position < user.roles.highest.position) return message.reply(`You cannot ban user who have higher role than you`);
         
        const reason = args.slice(1).join(" ") || "";
        const member = message.guild.members.cache.get(user.id);

        const _bans = await message.guild.bans.fetch();
        const bans = _bans.get(user.id)
        if (bans) {
            // Cooldowns
            bot.cooldown.set(client, message);
            return message.channel.send(
                `${user.user.username} is currently banned.`
            );
        }

        if (!member.bannable) {
            return bot.util.tempMessage(message, "I cannot ban this user")
        }

        const confirm = new ButtonBuilder()
            .setCustomId("confirm")
            .setLabel("Confirm")
            .setStyle(ButtonStyle.Danger);

        const cancel = new ButtonBuilder()
            .setCustomId("cancel")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(confirm, cancel);

        let banMsg = null;

        if (!args[1]) {
            banMsg = await message.reply({
                content: `Are you sure want to ban <@${member.user.id}> for no reason?`,
                components: [row],
            });
        } else {
            banMsg = await message.reply({
                content: `Are you sure you want to ban <@${member.user.id}> for reason: ${reason}?`,
                components: [row],
            });
        }

        let isClicked = false;
        setTimeout(() => {
            if (isClicked == false) {
                confirm.setDisabled(true);
                cancel.setDisabled(true);
                banMsg.edit({
                    content: `You did not react in time, ban cancelled.`,
                    components: [row],
                });
            } else if (isClicked == true) return;
        }, 20000);

        const collector = banMsg.createMessageComponentCollector();
        
        bot.cooldown.set(client, message);

        collector.on("collect", async (interaction) => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({
                    content: "You are not authorized to use this button.",
                    ephemeral: true,
                });
            }
            if (interaction.customId === "confirm") {
                isClicked = true;
                confirm.setDisabled(true);
                cancel.setDisabled(true);
                await interaction.update({ content: `Banning <@${member.user.id}>...` });
                await member
                    .ban({ reason: reason })
                    .then(() => {
                        confirm.setDisabled(true);
                        cancel.setDisabled(true);
                        banMsg.edit({
                            content: `<@${member.user.id}> was banned. Reason: ${
                                reason || "Not specified"
                            }`,
                            components: [row],
                        });
                    })
                    .catch((err) => {
                        confirm.setDisabled(true);
                        cancel.setDisabled(true);
                        banMsg.edit({
                            content: "I was unable to ban the user",
                            components: [row],
                        });
                    });
            } else if (interaction.customId === "cancel") {
                isClicked = true;
                confirm.setDisabled(true);
                cancel.setDisabled(true);
                await interaction.edit({
                    content: `Ban cancelled for <@${member.user.tag}>`,
                    components: [row],
                });
            }
            collector.stop();
        });
    },
};
