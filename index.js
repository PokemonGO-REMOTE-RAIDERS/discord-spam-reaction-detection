/**
 * 
 * Spam Reaction Detection
 * Version: 1.2.2
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

});

/**
 * 
 * Process Pokenav messages
 */
client.on('message', (message) => {

	if(process.env.guild !== message.channel.guild.id) {
		return;
	}

	// Only process PokeNav posts.   
	if( message.author.username === 'PokeNav' && message.author.bot )
	{
	
		// Use Discord.js Colletor to watch the reactions. 
		const filter = () => { return true };
		const collector = message.createReactionCollector(filter, { time: 10000, dispose: true });


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
			if(counts[key] >= process.env.threshold) {

				let loggedUser = message.channel.guild.members.cache.get(key);

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
				],
				timestamp: new Date(),
				footer: {
					text: 'Spammers information to follow:',
				}
			};

		
			// Send the log to the #reaction-spam-log channel.
			const logChannel 		= client.channels.cache.get(process.env.logchannel);
			const fastClickerChannel = client.channels.cache.get(process.env.fastclickerchannel);
			const punishment 		= message.channel.guild.roles.cache.find(role => role.id === process.env.punishment);
			const pokenavVerified 	= message.channel.guild.roles.cache.find(role => role.id === process.env.pokenavVerified );
			
			
			// drop in the embed card. 
			logChannel.send({ embed: logEmbedData });

			// Process each individual offenders.
			offendersList.forEach( (offender)=> {
			
				
				// Do all the things. 
				setTimeout(function(){
					
					// Send note to #reaction_log
					logChannel.send(`<@${offender.member.user.id}> reacted **${offender.reactions} times.**`);
					
					// Add Punishment Role
					offender.member.roles.add(punishment);
					console.log(`Added reaction punishment to ${offender.member.user.username}`);


					// Remove Verified Role
					if(offender.member.roles.cache.some(role => role.id === process.env.pokenavVerified)) {
						offender.member.roles.remove(pokenavVerified);
						console.log(`Remove pokenavVerified from ${offender.member.user.username}`);
					}
					

				}, 250);


				// Message the spammer in the #fastclicker channel.
				setTimeout(function(){
					fastClickerChannel.send(`<@${offender.member.user.id}>, you're in timeout for ${process.env.timeout} minutes because you reacted **${offender.reactions} times** on that raid. If you don't have access after ${process.env.timeout} minutes, please let an @ manager know.`);
				}, 3000);

				
				// Let them out of timeout. 
				var timeout = process.env.timeout * 60 * 1000;
				setTimeout(function(){
					// offender.member.roles.add(altdentVerified);
					offender.member.roles.add(pokenavVerified);
					offender.member.roles.remove(punishment);

					console.log(`Restored permissions to ${offender.member.user.username}`);
				}, timeout);
			});

		}


	});

	}

});

// Connect to Application
client.login(process.env.token);