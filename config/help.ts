const helpConfig: Record<string, Record<string, string>> = {
    economy: {
        profile: `View a user's profile.`,
        leaderboard: `List server leaderboard.`
    },
    guide: {
        help: `This command.`,
        faq: `View FAQ.`,
        links: `View some useful links.`,
        servers: `View server status.`
    },
    moderation: {
        ban: `Ban a user.`,
        kick: `Kick a user.`,
        purge: `Purge a channel's messages.`
    },
    music: {
        play: `Play a song / add it to the queue.`,
        queue: `View the server queue.`,
        nowplaying: `View what is currently playing.`,
        skip: `Skip a song.`,
        remove: `Remove a song from the queue.`,
        pause: `Pause the player.`,
        resume: `Resume the player.`,
        leave: `Leave the voice channel.`
    },
    roles: {
        betatester: `Get the Beta Tester role.`
    },
    utility: {
        checkurl: `Fetch any URL and return its response code.`,
        status: `Checks whether the game server is up.`
    }
};

export default helpConfig;
