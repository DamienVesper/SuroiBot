import colors from './colors.js';
import customData from './customData.js';
import emojis from './emojis.js';

import type { ClientEvents, Snowflake } from 'discord.js';
import type { ManagerOptions } from 'magmastream';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

const argv = yargs(hideBin(process.argv)).options({
    mode: { type: `string`, default: `dev` }
}).argv as Args;

const LAVALINK_HOST = new URL(process.env.LAVALINK_URL ?? `https://example.org`);

export const config = {
    mode: argv.mode,
    dev: {
        userID: `386940319666667521`,
        guildID: `516304983415848961`,
        overridePermissions: false
    },

    modules: {
        logging: {
            enabled: false
        },
        leveling: {
            enabled: true,
            xp: {
                min: 5,
                max: 30
            },
            level: {
                min: 0,
                max: 1e3
            },
            xpCooldown: 60, // 6e4,
            levelUpMessages: `none`
        },
        music: {
            enabled: true,
            nodes: [{
                host: LAVALINK_HOST.hostname,
                identifier: `0`,
                password: process.env.LAVALINK_TOKEN,
                port: Number(LAVALINK_HOST.port || (LAVALINK_HOST.protocol === `https` ? 443 : 80)),
                retryAmount: 10,
                retryDelay: 1e4,
                resumeStatus: true,
                resumeTimeout: 3e4,
                secure: LAVALINK_HOST.protocol === `https`
            }],
            options: {
                maxFilter: 100,
                equalizerBands: 15,
                trebleIntensityMultiplier: 0.15,
                bassIntensityMultiplier: 0.15,
                tremoloVibratoFrequency: 5,
                voiceTimeout: 3e4
            }
        }
    },

    customData,

    colors,
    emojis
} as const satisfies Config as Readonly<Config>;

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
        logging: Module<LoggingModule>
        /**
         * Leveling
         */
        leveling: Module<LevelingModule>
        /**
         * Music Player
         */
        music: Module<MusicModule>
    }

    /**
     * Custom data added to the config
     */
    customData: typeof customData

    colors: typeof colors
    emojis: typeof emojis
}

type Module<ModuleTypeNarrowing> =
    | { enabled: true } & ModuleTypeNarrowing
    | { enabled: false };

interface LoggingModule {
    channels: {
        modLog: Snowflake
        punishmentLog: Snowflake
    }

    events: Array<keyof ClientEvents>
}

interface LevelingModule {
    xp: Record<`min` | `max`, number>
    level: Record<`min` | `max`, number>

    xpCooldown: number
    levelUpMessages: `channel` | `dm` | `none`
}

interface MusicModule extends Partial<ManagerOptions> {
    options: {
        maxFilter: number
        equalizerBands: number
        trebleIntensityMultiplier: number
        bassIntensityMultiplier: number
        tremoloVibratoFrequency: number
        voiceTimeout: number
    }
}

interface Args {
    mode: `prod` | `dev`
}
