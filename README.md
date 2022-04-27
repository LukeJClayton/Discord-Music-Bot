# To start

Create bot and add to your server with the following permissions
 - View Channels
 - Manage Channels
 - Manage Roles
 - Manage Webhooks
 - Manage Server
 - Send Messages
 - Manage Messages
 - Manage Threads
 - Use Application Commands
 - Voice Channel Connect
 - Voice Channel Speak
 - Voice Channel Use Voice Activity
 - Manage Events
 - Administrator

To initalise the app run `npm install` in the root folder

Copy your bot token into the `auth.json` file

To start the bot itself run `node .` in the root folder

In your discord channel run `!deploy` to initalise the commands


# Avaliable commands

/play SONG_URL
- Plays a song from a youtube url

/pause
- Pauses the song that is currently playing

/resume
- Resume playback of the current song

/queue
- See the music queue

/skip
- Skip to the next song in the queue

/join
- Join the voice channel

/leave
- Leave the voice channel

/clear
- Clear all messages made by the bot