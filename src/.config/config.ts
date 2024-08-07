import colors from './colors.js';
import customData from './customData.js';
import emojis from './emojis.js';

import type { ClientEvents, Snowflake } from 'discord.js';
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
        guildID: `1269117681710137504`,
        overridePermissions: true
    },

    modules: {
        music: {
            enabled: true,
            nodes: [{
                host: process.env.LAVALINK_HOST!,
                identifier: `0`,
                password: process.env.LAVALINK_TOKEN,
                port: Number(process.env.LAVALINK_PORT!),
                retryAmount: 10,
                retryDelay: 1e4,
                resumeStatus: true,
                resumeTimeout: 3e4,
                secure: false
            }],
            options: {
                maxFilter: 100,
                equalizerBands: 15,
                trebleIntensityMultiplier: 0.15,
                bassIntensityMultiplier: 0.15,
                tremoloVibratoFequency: 5,
                voiceTimeout: 3e4
            }
        }
    },

    customData,

    colors,
    emojis
} as const satisfies Config as Config;

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
        /**
         * Whether to override the built-in permissions checker.
         */
        overridePermissions?: boolean
    }

    /**
     * Bot Modules
     */
    modules: {
        /**
         * Logging
         */
        logging?: Module<LoggingModule>
        /**
         * Music Player
         */
        music?: Module<MusicModule>
    }

    /**
     * Custom data added to the config
     */
    customData: typeof customData

    colors: typeof colors
    emojis: typeof emojis
}

type Module<ModuleTypeNarrowing> = ModuleTypeNarrowing & { enabled: boolean };

export interface LoggingModule {
    channels: {
        modLog: Snowflake
        punishmentLog: Snowflake
    }

    events: Array<keyof ClientEvents>
}

export interface MusicModule {
    nodes: NodeOptions[]
    options: {
        maxFilter: number
        equalizerBands: number
        trebleIntensityMultiplier: number
        bassIntensityMultiplier: number
        tremoloVibratoFequency: number
        voiceTimeout: number
    }
}

interface Args {
    mode: `prod` | `dev`
}
