const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const client = new Discord.Client();

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {
    
    if(message.author.username === 'PokeNav' && message.author.bot) {
        
        const filter = (user) => {
            return true
        };

        console.log(message.author.username);

        const collector = message.createReactionCollector(filter, { time: 15000, dispose: true });

        let reactionsCollection = [];
        let count = 0;

        collector.on('collect', (reaction, user) => {
            reactionsCollection[count] = user.username;
            count++;
        });
        

        collector.on('end', collected => {
            
            let counts = {};
            reactionsCollection.forEach((index) => counts[index] = (counts[index] || 0) + 1 );

            let buildFields = [];
            Object.keys(counts).map(function(key, index) {
                buildFields[index] = {
                    name: `@${key}`,
                    value: `Reactions: ${counts[key]}`,
                    inline: true,
                }
            });

            const logEmbedData = {
                color: 0x0099ff,
                title: 'New Reaction Log',
                author: {
                    name: 'Reaction Spam Detector',
                },
                description: `Reaction Log for ${message.content} posted to <#${message.channel.id}>`,
                fields: buildFields,
                timestamp: new Date(),
                footer: {
                    text: 'Contact @nhemps311 for help with this bot.',
                }
            };

            //console.log(logEmbedData);
            //console.log(message.channel);

            message.channel.send({ embed: logEmbedData });

        });

    }

});


// reactionsCollection = [
//     'nhemps311#0872', 
//     'WHempsey#6500',
//     'WHempsey#6500',
//     'WHempsey#6500',
//     'nhemps311#0872', 
//     'WHempsey#6500',
//     'nhemps311#0872', 
//     'WHempsey#6500',
//     'nhemps311#0872', 
//     'WHempsey#6500',
//     'nhemps311#0872', 
//     'WHempsey#6500',
//     'nhemps311#0872', 
//     'WHempsey#6500',
//     'nhemps311#0872', 
//     'WHempsey#6500',
//     'nhemps311#0872', 
//     'WHempsey#6500',
// ];

/*
Message {
  channel: <ref *1> TextChannel {
    type: 'text',
    deleted: false,
    id: '802628973896400926',
    name: 'active-raids',
    rawPosition: 0,
    parentID: '802637002696687626',
    permissionOverwrites: Collection(1) [Map] {
      '801259935602180166' => [PermissionOverwrites]
    },
    topic: null,z
    nsfw: false,
    lastMessageID: '802650143349538817',
    rateLimitPerUser: 0,
    lastPinTimestamp: null,
    guild: Guild {
      members: [GuildMemberManager],
      channels: [GuildChannelManager],
      roles: [RoleManager],
      presences: [PresenceManager],
      voiceStates: [VoiceStateManager],
      deleted: false,
      available: true,
      id: '801267957694726194',
      shardID: 0,
      name: 'Reaction Spam Test',
      icon: null,
      splash: null,
      discoverySplash: null,
      region: 'us-east',
      memberCount: 4,
      large: false,
      features: [],
      applicationID: null,
      afkTimeout: 300,
      afkChannelID: null,
      systemChannelID: '801267957694726197',
      embedEnabled: undefined,
      premiumTier: 0,
      premiumSubscriptionCount: 0,
      verificationLevel: 'NONE',
      explicitContentFilter: 'DISABLED',
      mfaLevel: 0,
      joinedTimestamp: 1611107856013,
      defaultMessageNotifications: 'ALL',
      systemChannelFlags: [SystemChannelFlags],
      maximumMembers: 100000,
      maximumPresences: null,
      approximateMemberCount: null,
      approximatePresenceCount: null,
      vanityURLCode: null,
      vanityURLUses: null,
      description: null,
      banner: null,
      rulesChannelID: null,
      publicUpdatesChannelID: null,
      preferredLocale: 'en-US',
      ownerID: '310756994044657674',
      emojis: [GuildEmojiManager]
    },
    messages: MessageManager {
      cacheType: [class LimitedCollection extends Collection],
      cache: [LimitedCollection [Map]],
      channel: [Circular *1]
    },
    _typing: Map(0) {}
  },
  deleted: false,
  id: '802650143349538817',
  type: 'DEFAULT',
  system: false,
  content: '**Ampharos-Mega** until **05:02 PM**\nin: <#802650139377401889>',
  author: User {
    id: '428187007965986826',
    system: false,
    locale: null,
    flags: UserFlags { bitfield: 65536 },
    username: 'PokeNav',
    bot: true,
    discriminator: '4300',
    avatar: 'bb9a8abbacb83885919c3f9db60ff7cd',
    lastMessageID: '802650143349538817',
    lastMessageChannelID: '802628973896400926'
  },
  pinned: false,
  tts: false,
  nonce: null,
  embeds: [
    MessageEmbed {
      type: 'rich',
      title: null,
      description: null,
      url: null,
      color: 15522437,
      timestamp: 1611437106531,
      fields: [Array],
      thumbnail: [Object],
      image: null,
      video: null,
      author: [Object],
      provider: null,
      footer: [Object],
      files: []
    }
  ],
  attachments: Collection(0) [Map] {},
  createdTimestamp: 1611437106693,
  editedTimestamp: 0,
  reactions: ReactionManager {
    cacheType: [class Collection extends Collection],
    cache: Collection(0) [Map] {},
    message: [Circular *2]
  },
  mentions: MessageMentions {
    everyone: false,
    users: Collection(0) [Map] {},
    roles: Collection(0) [Map] {},
    _members: null,
    _channels: null,
    crosspostedChannels: Collection(0) [Map] {}
  },
  webhookID: null,
  application: null,
  activity: null,
  _edits: [],
  flags: MessageFlags { bitfield: 0 },
  reference: null
}


*/

client.login(token);