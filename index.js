/**
 * 
 * Spam Reaction Detection
 * Version: 1.2
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
//const botName = process.env.BOTNAME;


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
	logChannel.send(`**Reaction Bot v1.2 is online.**`);

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

				//console.log(loggedUser);
				offendersList[i] = {
					member: loggedUser,
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
			const logChannel 		= client.channels.cache.get(process.env.LOG);
			const fastClickerChannel = client.channels.cache.get(process.env.FASTCLICKER);
			const punishment 		= message.channel.guild.roles.cache.find(role => role.name === 'reaction_punishment');
			const verified 		= message.channel.guild.roles.cache.find(role => role.name === 'verified');
			const mystic 			= message.channel.guild.roles.cache.find(role => role.name === 'mystic');
			const instinct 		= message.channel.guild.roles.cache.find(role => role.name === 'instinct');
			const valor 			= message.channel.guild.roles.cache.find(role => role.name === 'valor');
			

			// Send out the ping to manager. 
			//logChannel.send(`<@&${process.env.MANAGER}> potential spam clicking, see below:`);
			
			// drop in the embed card. 
			logChannel.send({ embed: logEmbedData });

			// Process each individual offenders.
			offendersList.forEach( (offender)=> {
			
				let userTeam;
				
				// Do all the things. 
				setTimeout(function(){
					
					// Send note to #reaction_log
					logChannel.send(`<@${offender.member.user.id}> reacted **${offender.reactions} times.**`);
					//logChannel.send(offender.member.user.id);
					
					// Add Punishment Role
					offender.member.roles.add(punishment);
					console.log(`Added reaction punishment to ${offender.member.user.username}`);

					// Remove Verified Role
					offender.member.roles.remove(verified);
					console.log(`Remove verified from ${offender.member.user.username}`);
					

					// Remove from their team.
					if(offender.member.roles.cache.some(role => role.name === 'mystic')) {
						
						offender.member.roles.remove(mystic);
						userTeam = mystic;
					}
					
					if(offender.member.roles.cache.some(role => role.name === 'instinct')) {
						
						offender.member.roles.remove(instinct);	
						userTeam = instinct;
					}
					
					if(offender.member.roles.cache.some(role => role.name === 'valor')) {
						
						offender.member.roles.remove(valor);
						userTeam = valor;	
					}

					console.log(`Removed ${userTeam.name} from ${offender.member.user.username}`);


				}, 250);


				// Message the spammer in the #fastclicker channel.
				setTimeout(function(){
					fastClickerChannel.send(`<@${offender.member.user.id}>, you're in timeout for ${process.env.TIMEOUT} minutes because you reacted **${offender.reactions} times** on that raid. If you don't have access after ${process.env.TIMEOUT} minutes, please let an @ manager know. *MANAGER NOTE: Team ${userTeam.name}*`);
				}, 3000);

				
				// Let them out of timeout. 
				var timeout = process.env.TIMEOUT * 60 * 1000;
				setTimeout(function(){
					offender.member.roles.add(userTeam);
					offender.member.roles.add(verified);
					offender.member.roles.remove(punishment);

					console.log(`Restored permissions to ${offender.member.user.username}`);
				}, timeout);
			});

		}


	});

	}

});

// Connect to Application
client.login(process.env.TOKEN);