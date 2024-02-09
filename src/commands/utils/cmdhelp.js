const { EmbedBuilder } = require("discord.js");
const { readdirSync } = require("fs");
const { cooldown, database, config, util } = require("../../../utils/bot")
// Cooldowns 
const { Collection } = require('discord.js');
const cooldowns = new Collection();

module.exports = {
   name: "cmdhelp",
   aliases: ["ch"],
   cooldown: 10,
   usage: ["<command name>"],
   description: "Tells Information About Commands",
   run: async (client, message, args) => {
        const data = database.get(message.author.id)
        if (cooldown.has(cooldowns, message)) return;
	
	// Don't change this code
      if (!args[0]) {
         return util.tempMessage(message, "Please Specified A Command Name...")
      } else {
         let cots = [];
         let catts = [];

         readdirSync("./src/commands/").forEach((dir) => {
            if (dir.toLowerCase() !== args[0].toLowerCase()) return;

            const commands = readdirSync(`./src/commands/${dir}`).filter((file) =>
               file.endsWith(".js")
            );

            const cmds = commands.map((command) => {
               let file = require(`../../commands/${dir}/${command}`);

               if (!file.name) return "No command name.";

               let name = file.name.replace(".js", "");

               let des = client.commands.get(name).description;
               let emo = client.commands.get(name).emoji;

               let obj = {
                  cname: `${emo ? emo : ""} - \`${name}\``,
                  des,
               };

               return obj;
            });

            let dota = new Object();

            cmds.map((co) => {
               dota = {
                  name: `${cmds.length === 0 ? "In progress." : co.cname}`,
                  value: co.des ? co.des : "No Description",
                  inline: true,
               };
               catts.push(dota);
            });

            cots.push(dir.toLowerCase());
         });

         const command =
            client.commands.get(args[0].toLowerCase()) ||
            client.commands.find(
               (c) => c.aliases && c.aliases.includes(args[0].toLowerCase())
            );

         if (cots.includes(args[0].toLowerCase())) {
            return;
         }
         // To this

         if (!command) {
             return util.tempMessage(message, `Invalid command! Use \`${config.prefix[0]}help\` for all of my commands!`)
         }
         
         // Cooldowns
    cooldowns.set(cooldowns, message.author.id, message);

         const embed = new EmbedBuilder()
            .setTitle("Command Details")
            .setColor("Blue")
            .setDescription(`**Symbols Information**\n• <> = Require\n• [] = Optional\n*Note:* Do not use the symbol above when using the command`)
            .addFields({ name: "Command", value: command.name ? `${command.name}` : "No name"})
            .addFields({ name: "Description", value: command.description ? command.description : "No description."})
            .addFields({ name: "Aliases", value: command.aliases ? `${command.aliases.join(" ,")}` : "No aliases."})
            .addFields({ name: "Usage", value: command.usage ? `${config.prefix[0]}${command.name} ${command.usage.join(`\n${config.prefix[0]}${command.name} `)}` : `${config.prefix[0]}${command.name}`})
            .addFields({ name: "Cooldown", value: command.cooldown ? `${command.cooldown} seconds` : `None`})
            .addFields({ name: "Premium Only", value: command.premium ? `${command.premium}` : `False` })
            .setFooter({
              text: `Requested by ${message.author.tag}`,
              iconURl: message.author.displayAvatarURL({ dynamic: true, })
            })
            .setTimestamp()
         message.channel.send({ embeds: [embed] });
      }
   },
};
