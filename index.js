/**
 * 
 * Configuration File
 */
const dotenv = require('dotenv');
dotenv.config();
const botName = process.env.BOTNAME;


/**
 * 
 * Init Discord
 * 
 */
const Discord = require('discord.js');
const client = new Discord.Client();



client.once('ready', () => {
  console.log('Ready!');

  client.user.setActivity('for Auto-Clickers.', { type: 'WATCHING' });
  
  const logChannel = client.channels.cache.get(process.env.LOG);
  const botReadyMessage = new Discord.MessageEmbed().setTitle(`${botName} is online!`);
  logChannel.send({ embed: botReadyMessage });

});


/**
 * 
 * Process Pokenav messages
 */
client.on('message', (message) => {


  // Only process PokeNav posts.   
  if(message.author.username === 'PokeNav' && message.author.bot) {

    // Use Discord.js Colletor to watch the reactions. 
    const filter = (reaction) => { return true };
    const collector = message.createReactionCollector(filter, { time: 15000, dispose: true });


    // We store all reactions in this array. 
    let reactionsCollection = [];
    let count = 0;
    collector.on('collect', (reaction, user) => {

      // Add the new user to the reaction array. 
      reactionsCollection[count] = user.id;
      count++;

    });


    // After the time expires on the reaction poll we process.
    collector.on('end', collected => {

      // Count up all of the reactions per ßuser. 
      let counts = {};
      reactionsCollection.forEach((index) => counts[index] = (counts[index] || 0) + 1 );


      // Build the Inline Fields that show the Users name and how many reactions they made.
      let inlineFields = [];
      Object.keys(counts).map(function(key, index) {
        
        let loggedUser = message.channel.guild.members.cache.get(key);
        
          inlineFields[index] = {
              name: `@${loggedUser.user.username}`,
              value: `${loggedUser.user.id}\nReactions: ${counts[key]}\n  `,
              inline: true,
          }
        
      });


      // Build the Embed Data for the log. 
      const logEmbedData = {
          color: '#47b582',
          title: 'New Reaction Log',
          author: {
              name: botName,
          },
          description: `Reaction Log for ${message.content} posted to <#${message.channel.id}>`,
          fields: inlineFields,
          timestamp: new Date(),
          footer: {
              text: 'Contact @nhemps311 for help with this bot.',
          }
      };

      
      // Send the log to the #reaction-spam-log channel.
      const logChannel = client.channels.cache.get(process.env.LOG);
      logChannel.send({ embed: logEmbedData });


    });

  }

});


client.login(process.env.TOKEN);