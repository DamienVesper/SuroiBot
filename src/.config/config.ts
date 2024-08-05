import colors from './colors.js';
import emojis from './emojis.js';

import type { Snowflake } from 'discord.js';
import type { NodeOptions } from 'magmastream';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

const argv = yargs(hideBin(process.argv)).options({
    mode: { type: `string`, default: `dev` }
}).argv as Args;

export const config = {
    mode: argv.mode,
    dev: {
        userID: `386940319666667521`,
        guildID: `1269117681710137504`
    },

    modules: {
        music: {
            enabled: true,
            lavalinkNodes: [{
                host: process.env.LAVALINK_HOST!,
                identifier: `Lavalink`,
                password: process.env.LAVALINK_TOKEN,
                port: 40006,
                retryAmount: 1000,
                retryDelay: 10000,
                resumeStatus: true,
                resumeTimeout: 1000,
                secure: false
            }]
        }
    },

    colors,
    emojis
} satisfies Config as Config;

interface Config {
    /**
     * Mode to run the bot in.
     */
    mode: Args[`mode`]

    /**
     * Development module.
     */
    dev: {
        /**
         * The user to be given full access to the bot in developer mode.
         */
        userID: Snowflake
        /**
         * The guild where slash commands should be applied, and where the bot is usable in developer mode.
         */
        guildID: Snowflake
    }

    /**
     * Bot Modules
     */
    modules: {
        /**
         * Music Player
         */
        music: Module<MusicModule>
    }

    colors: typeof colors
    emojis: typeof emojis
}

type Module<ModuleTypeNarrowing, enabled = boolean> = enabled extends true ? ModuleTypeNarrowing & { enabled: enabled } : { enabled: enabled };

interface MusicModule {
    lavalinkNodes: NodeOptions[]
}

interface Args {
    mode: `prod` | `dev`
}
