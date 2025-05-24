import colors from "./colors.js";
import customData from "./customData.js";
import emojis from "./emojis.js";

import type { ClientEvents, Snowflake } from "discord.js";
import type { ManagerOptions } from "magmastream";

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const argv = yargs(hideBin(process.argv)).options({
    mode: { type: "string", default: "dev" }
}).argv as Args;

const LAVALINK_HOST = new URL(process.env.LAVALINK_URL ?? "https://example.org");

export const config = {
    mode: argv.mode,
    dev: {
        users: ["386940319666667521", "753029976474779760"],
        guildID: "516304983415848961",
        overridePermissions: false
    },

    db: {
        connectionString: process.env.DATABASE_URL!,
        ssl: false
    },

    modules: {
        caching: {
            connectionString: process.env.REDIS_URL!,
            prefix: "suroibot",
            enabled: true
        },
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
            xpCooldown: 6e4,
            levelUpMessages: "none"
        },
        gameModeration: {
            enabled: false
        },
        music: {
            enabled: true,
            nodes: [{
                host: LAVALINK_HOST.hostname,
                identifier: "0",
                password: process.env.LAVALINK_TOKEN,
                port: Number(LAVALINK_HOST.port || (LAVALINK_HOST.protocol === "https" ? 443 : 80)),
                retryAmount: 10,
                retryDelay: 1e4,
                resumeStatus: true,
                resumeTimeout: 3e4,
                secure: LAVALINK_HOST.protocol === "https"
            }],
            lastFmApiKey: process.env.LAVALINK_LASTFM_APIKEY!,
            options: {
                maxFilter: 100,
                equalizerBands: 15,
                trebleIntensityMultiplier: 0.15,
                bassIntensityMultiplier: 0.15,
                tremoloVibratoFrequency: 5,
                voiceTimeout: 3e4
            }
        },
        suroi: {
            enabled: false
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
    mode: Args["mode"]

    /**
     * Development module.
     */
    dev: {
        /**
         * The user(s) to be given full access to the bot in developer mode.
         */
        users: Snowflake[]
        /**
         * The guild where slash commands should be applied, and where the bot is usable in developer mode.
         */
        guildID: Snowflake
        /**
         * Enabling this will use the permissions in the config file, rather than Discord permissions.
         */
        overridePermissions?: boolean
    }

    db: {
        /**
         * The database connection string.
         */
        connectionString: string
        /**
         * Whether to use SSL.
         */
        ssl: boolean
    }

    /**
     * Bot Modules
     */
    modules: {
        /**
         * Caching
         */
        caching: Module<CachingModule>
        /**
         * Logging
         */
        logging: Module<LoggingModule>
        /**
         * Leveling
         */
        leveling: Module<LevelingModule>
        /**
         * Game Moderation
         */
        gameModeration: Module<GameModeration>
        /**
         * Music Player
         */
        music: Module<MusicModule>
        /**
         * Suroi API
         */
        suroi: Module<SuroiModule>
    }

    /**
     * Custom data added to the config
     */
    customData: typeof customData

    colors: typeof colors
    emojis: typeof emojis
}

type Module<ModuleTypeNarrowing> =
    | { enabled: false } & Partial<ModuleTypeNarrowing>
    | { enabled: true } & ModuleTypeNarrowing;

interface CachingModule {
    /**
     * The database connection string.
     */
    connectionString: string
    /**
     * The prefix of all Redis keys.
     */
    prefix: string
}

interface LoggingModule {
    channels: {
        modLog: Snowflake
        punishmentLog: Snowflake
    }

    events: Array<keyof ClientEvents>
}

interface LevelingModule {
    xp: Record<"min" | "max", number>
    level: Record<"min" | "max", number>

    xpCooldown: number
    levelUpMessages: "channel" | "dm" | "none"
}

interface GameModeration {
    /**
     * The ingame moderation guild.
     */
    guild: Snowflake
    /**
     * Roles in the ingame moderation guild.
     */
    roles: Record<"leader" | "gameMod", Snowflake>
    /**
     * Base API URL.
     */
    apiUrl: string
    /**
     * API Key
     */
    apiKey: string
}

interface MusicModule extends Partial<ManagerOptions> {
    lastFmApiKey: string
    options: {
        maxFilter: number
        equalizerBands: number
        trebleIntensityMultiplier: number
        bassIntensityMultiplier: number
        tremoloVibratoFrequency: number
        voiceTimeout: number
    }
}

interface SuroiModule {
    baseURL: string
    apiKey: string
}

interface Args {
    mode: "prod" | "dev"
}
