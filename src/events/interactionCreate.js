const { EmbedBuilder, Collection, PermissionsBitField } = require('discord.js');
const ms = require('ms');
const client = require('../index');
const { database, config } = require("../../utils/bot")
const cooldown = new Collection();
const premium = new Collection();
const pcooldown = new Collection();
const developer = new Collection();

client.on('interactionCreate', async interaction => {
  const data = await database.get(interaction.user.id)
  if (data?.blacklist == true) return;
  
  const slashCommand = client.slashCommands.get(interaction.commandName);
  if (interaction.type == 4) {
    if (slashCommand.autocomplete) {
      const choices = [];
      await slashCommand.autocomplete(interaction, choices)
    }
  }
  if (!interaction.type == 2) return;

  if (!slashCommand) return client.slashCommands.delete(interaction.commandName);
  try {


// Additional Code Place 

  if (slashCommand) {
     if (!premium.has(slashCommand.name)) {
         premium.set(slashCommand.name, new Collection());
     }
     if (slashCommand.premium && data?.isPremium == false) {
      const premiumEmbed = new EmbedBuilder()
        .setColor('Yellow')
        .setTitle('You need premium features')
        .setDescription(`${slashCommand.name} is only available for premium users\nTo buy this feature you can buy it through the official Discord server by typing ${prefix}premium`);
      return interaction.reply({ embeds: [premiumEmbed]});
     }
    }
// PREMIUM USER CODE END


// DEVELOPER USER 
   if (slashCommand) {
       if (!developer.has(slashCommand.name)) {
           developer.set(slashCommand.name, new Collection());
       }
       
       if (slashCommand.developer && data?.isDeveloper == false) {
         const developerMessage = `**ⓧ | This command is only available for developers**`;
         return interaction.reply(developerMessage).then(msg => {
           setTimeout(() => {
            msg.delete();
          }, 10000);
        });
       }
   }
// DEVELOPER USER END

// COOLDOWNS CODE
    if (slashCommand) {
      if (!cooldown.has(slashCommand.name)) {
        cooldown.set(slashCommand.name, new Collection());
      }

      const current_time = Date.now();
      const time_stamps = cooldown.get(slashCommand.name);
      let cooldown_amount = (slashCommand.cooldown) * 1000;
      
      if (data?.isPremium == true) {
        cooldown_amount -= cooldown_amount * 0.35;
      }

      if (time_stamps.has(interaction.user.id)) {
        const expiration_time = time_stamps.get(interaction.user.id) + cooldown_amount;

        if (current_time < expiration_time) {
          const time_left = (expiration_time - current_time) / 1000;
          const cooldownMessage = `**⏱ | ${interaction.user.username}**! Please wait and try the command again **in ${time_left.toFixed(1)} seconds**`;
          return interaction.reply(cooldownMessage).then(msg => {
            setTimeout(() => {
              msg.delete().catch(err => console.error(err));
            }, time_left.toFixed(1));
          });
          }
        }

      time_stamps.set(interaction.user.id, current_time);

      setTimeout(() => time_stamps.delete(interaction.user.id), cooldown_amount);
      // COOLDOWNS CODE END

      await slashCommand.run(client, interaction);
    }
  } catch (error) {
    console.log(error);
  }
});