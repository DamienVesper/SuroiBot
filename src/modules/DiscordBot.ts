import { config } from '../config/config.js';
import {
    ActivityType,
    Client,
    Collection,
    GatewayIntentBits,
    Partials
} from 'discord.js';

import { Logger } from './Logger.js';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

export class DiscordBot extends Client {
    config = config;

    logger = new Logger(
        resolve(fileURLToPath(import.meta.url), `../../logs/console.log`),
        resolve(fileURLToPath(import.meta.url), `../../logs/error.log`)
    );

    commands = new Collection();
    subcommands = new Collection();
    cooldowns = new Collection();

    constructor () {
        super({
            partials: [
                Partials.Channel,
                Partials.GuildMember,
                Partials.GuildScheduledEvent,
                Partials.Message,
                Partials.Reaction,
                Partials.User
            ],
            intents: [
                GatewayIntentBits.AutoModerationConfiguration,
                GatewayIntentBits.AutoModerationExecution,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.GuildEmojisAndStickers,
                GatewayIntentBits.GuildInvites,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildModeration,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildScheduledEvents,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.MessageContent
            ],
            presence: {
                status: `dnd`,
                activities: [{
                    type: ActivityType.Watching,
                    name: `Suroi.io`,
                    url: `https://discord.gg/suroi`
                }]
            }
        });
    }
}
