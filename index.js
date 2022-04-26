const Discord = require('discord.js');
const { Interaction, GuildMember, Snowflake } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

const client = new Discord.Client({ intents: ['GUILD_VOICE_STATES', 'GUILD_MESSAGES', 'GUILDS'] });
const { token } = require('./auth.json');

client.on('ready', () => console.log('Ready!'));

client.on('messageCreate', async (message) => {
  if (!message.guild) return;
  if (!client.application.owner) await client.application.fetch();

  if (message.content.toLowerCase() === '!deploy' && message.author.id === client.application.owner.id) {
    await message.guild.commands.set([
      {
        name: 'play',
        description: 'Plays a song',
        options: [
          {
            name: 'song',
            type: 'STRING',
            description: 'The URL of the song to play',
            required: true,
          },
        ],
      },
      {
        name: 'skip',
        description: 'Skip to the next song in the queue',
      },
      {
        name: 'queue',
        description: 'See the music queue',
      },
      {
        name: 'pause',
        description: 'Pauses the song that is currently playing',
      },
      {
        name: 'resume',
        description: 'Resume playback of the current song',
      },
      {
        name: 'leave',
        description: 'Leave the voice channel',
      },
      {
        name: 'join',
        description: 'Join the voice channel',
      },
      {
        name: 'clear',
        description: 'Clear all messages made by the bot'
      }
    ]);

    await message.reply('Deployed!');
  }
});

let connection;
let player;
let queue = [];

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand() || !interaction.guildId) return;


  if (interaction.commandName === 'play') {
    const channel = interaction.member.voice.channel;

    connection = join(interaction);
    
    let song;

    if (connection) {
      const url = interaction.options.get('song').value;
      if (ytdl.validateURL(url)) {
        let song_info = await ytdl.getInfo(url)
        song = { title: song_info.videoDetails.title, url: song_info.videoDetails.video_url }
      }
    } else {
      interaction.reply('Unable to join channel, you must be in a voice channel to use the bot');
    }

    if (song) {
      queue.push(song)

      const stream = ytdl(song.url, {
        filter: "audioonly"
      });

      let resource = createAudioResource(stream);
      let connected = false;

      if (!player) {
        player = createAudioPlayer();
        await player.play(resource);
        connection.subscribe(player);

        player.on(AudioPlayerStatus.Idle, () => {
          if (queue.length) {
            queue.shift();
          }

          if (queue[0]) {
            const stream = ytdl(queue[0].url, {filter: 'audioonly', type: 'opus', highWaterMark: 1<<25 }, {highWaterMark: 1});

            resource = createAudioResource(stream);

            player.play(resource);
          }
        });
      }

      if (queue.length == 1) {
        interaction.reply('Playing song: ' + song.title);
      } else {
        interaction.reply('Song added to queue');
      }

      let delayActive = false;
    } else if (connection) {
      interaction.reply('Unable to play song');
    }
  } else if (interaction.commandName === 'pause') {
    if (player) {
      player.pause();
      interaction.reply('Pausing current song');
    } else {
      interaction.reply('No song playing');
    }
  } else if (interaction.commandName === 'resume') {
    if (player) {
      player.unpause();
      interaction.reply('Resuming current song');
    } else {
      interaction.reply('No song playing');
    }
  } else if (interaction.commandName === 'join') {
    connection = join(interaction);

    if (connection) {
      interaction.reply('Joining channel');
    }
  } else if (interaction.commandName === 'leave') {
    if (connection) {
      interaction.reply('Leaving channel');
      connection.destroy();
    } else {
      interaction.reply('The bot is not currently in any channel');
    }
  } else if (interaction.commandName === 'clear') {
    interaction.reply("Removing messages");

    const Channel = interaction.channel;

    let Messages = await Channel.messages.fetch({limit: 100});

    Messages.forEach(msg => {
      if (msg.author.id == client.user.id) msg.delete()
    });

    let delayInterval = setInterval(function () {
      Channel.messages.fetch({limit: 1}).then(function (messages) {
        messages.forEach(msg => {
          if (msg.author.id == client.user.id) msg.delete()
        });

        clearInterval(delayInterval);
      });
    }, 2000)
  }
});

let join = function (interaction) {
  if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
    const channel = interaction.member.voice.channel;

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    })

    return connection;
  }

  if (interaction.commandName === 'join') {
    interaction.reply('You must be in a voice channel to use the bot');
  }

  return;
}

client.login(token);