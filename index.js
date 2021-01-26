/**
 * 
 * Configuration File
 */
const dotenv = require('dotenv');
dotenv.config();

const TOKEN = process.env.TOKEN;
const PREFIX = process.env.PREFIX;
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
});


/**
 * 
 * Process Pokenav messages
 */
client.on('message', message => {


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
      reactionsCollection[count] = user.username+' - '+ user.id;
      count++;

    });


    // After the time expires on the reaction poll we process.
    collector.on('end', collected => {
      

      // Count up all of the reactions per user. 
      let counts = {};
      reactionsCollection.forEach((index) => counts[index] = (counts[index] || 0) + 1 );


      // Build the Inline Fields that show the Users name and how many reactions they made.
      let inlineFields = [];
      Object.keys(counts).map(function(key, index) {

        inlineFields[index] = {
            name: `@${key}`,
            value: `Reactions: ${counts[key]}`,
            inline: true,
        }

      });


      // Build the Embed Data for the log. 
      const logEmbedData = {
          color: '#0000FF',
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
      const channel = client.channels.cache.get('803441337424412702');
      channel.send({ embed: logEmbedData });

    });

  }

});


client.login(TOKEN);