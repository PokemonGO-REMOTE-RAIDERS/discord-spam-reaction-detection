/**
 * 
 * Spam Reaction Detection
 * Version: 1.1
 * 
 * Author: Nick Hempsey
 * Author URL: https://elementmarketingcompany.com
 * 
 * 
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


console.log(process.env.LOG);

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
  if( message.author.username === 'PokeNav' && message.author.bot && process.env.GUILD === message.channel.guild.id )
  {

    // Use Discord.js Colletor to watch the reactions. 
    const filter = () => { return true };
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
    collector.on('end', () => {

      // Count up all of the reactions per user. 
      let counts = {};
      reactionsCollection.forEach((index) => counts[index] = (counts[index] || 0) + 1 );


      // Establish the offenders list. 
      let offendersList = [];
      let i = 0;
      let totalReacts = 0;

      // Loop through the reactionsCollection
      Object.keys(counts).map(function(key) {
        
        // Only add users above the threshold
        if(counts[key] >= process.env.THRESHOLD) {

          let loggedUser = message.channel.guild.members.cache.get(key);
          
          offendersList[i] = {
                user: loggedUser.user,
                reactions: counts[key],
          }

          i++;

        }

        totalReacts++;

      });


      // Only send messages if we have users in the offenders list.
      if(offendersList.length >= 1) {


        // Build the Embed Data for the log. 
        const logEmbedData = {
            type: 'rich',
            color: '#157613',
            title: 'Potential Spam Clicker(s) Found',
            thumbnail: message.embeds[0].thumbnail,
            description: `Reaction Log for ${message.content} posted to <#${message.channel.id}>`,
            fields: [
              {
                name: 'Raid Location',
                value: message.embeds[0].author.name,
                inline: true,
              },
              {
                name: 'Users Reacted',
                value: totalReacts,
                inline: true,
              },
              {
                name: 'Spam Reactors',
                value: offendersList.length,
                inline: true,
              },
              {
                name: 'MODERATOR NOTE:',
                value: 'If you take action on any of the spammers, please react with a :thumbsup: on the users name so we know that user has been logged.',
                inline: false,
              },
            ],
            timestamp: new Date(),
            footer: {
              text: 'Spammers information to follow:',
            }
        };

        
        // Send the log to the #reaction-spam-log channel.
        const logChannel = client.channels.cache.get(process.env.LOG);

        // Send out the ping to manager. 
        logChannel.send(`<@&${process.env.MANAGER}> potential spam clicking, see below:`);
        
        // drop in the embed card. 
        logChannel.send({ embed: logEmbedData });

        // Process each individual offenders.
        offendersList.forEach( (offender)=> {
          
          // Send Messages to log
          logChannel.send(`**@${offender.user.username} reacted ${offender.reactions} times.**`);
          
          setTimeout(function(){
            logChannel.send(offender.user.id);
          }, 100);
          

        });

      }


    });

  }

});


client.login(process.env.TOKEN);

