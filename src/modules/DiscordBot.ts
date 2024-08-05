/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-misused-promises */
import { config } from '../.config/config.js';

import {
    ActivityType,
    Client,
    Collection,
    GatewayIntentBits,
    Partials,
    Routes,
    EmbedBuilder,
    type Snowflake,
    type User
} from 'discord.js';

import { resolve } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { readdirSync } from 'fs';

import { Logger } from './Logger.js';

import type { Command } from '../classes/Command.js';
import type { Event } from '../classes/Event.js';

import { Manager } from 'magmastream';

export class DiscordBot extends Client<true> {
    config = config;

    logger = new Logger({
        files: {
            log: resolve(fileURLToPath(import.meta.url), `../../logs/console.log`),
            errorLog: resolve(fileURLToPath(import.meta.url), `../../logs/error.log`)
        },
        handleExceptions: true
    });

    commands = new Collection<Command[`cmd`][`name`], Command>();
    subcommands = new Collection();
    cooldowns = new Collection<Snowflake, Array<Command[`cmd`][`name`]>>();

    lavalinkManager!: Manager;

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

        if (this.config.modules.music.enabled) {
            this.lavalinkManager = new Manager({
                nodes: this.config.modules.music.lavalinkNodes,
                send: (id, payload) => {
                    const guild = this.guilds.cache.get(id);
                    if (guild) guild.shard.send(payload);
                }
            });

            this.lavalinkManager.on(`nodeConnect`, node => {
                this.logger.info(`Lavalink Manager`, `Connected to node ${node.options.identifier}.`);
            });

            this.lavalinkManager.on(`nodeError`, (node, error) => {
                this.logger.error(`Lavalink Manager`, `Node ${node.options.identifier} encountered an error:`, error.message);
            });
        }
    }

    /**
     * Load events.
     * @param dir The directory to load events from.
     */
    loadEvents = async (dir: string): Promise<void> => {
        const files = readdirSync(dir, {
            recursive: true,
            withFileTypes: true
        }).filter(file => file.name.endsWith(`.ts`) || file.name.endsWith(`.js`));

        for (const file of files) {
            const ClientEvent = (await import(pathToFileURL(resolve(file.parentPath, file.name)).href)).default as typeof Event;
            const event = new ClientEvent(this);

            if (event.config.once) this.once(event.config.name as string, event.run.bind(null));
            else this.on(event.config.name as string, event.run.bind(null));
        }
    };

    /**
     * Load commands.
     * @param dir The directory to load commands from.
     */
    loadCommands = async (dir: string): Promise<void> => {
        // Get all the files (commands and subcommands).
        const files = readdirSync(dir, {
            recursive: true,
            withFileTypes: true
        }).filter(file => file.name.endsWith(`.ts`) || file.name.endsWith(`.js`));

        for (const file of files) {
            const ClientCommand = (await import(pathToFileURL(resolve(file.parentPath, file.name)).href)).default as typeof Command;
            const command = new ClientCommand(this);

            this.commands.set(command.cmd.name, command);
        }
    };

    deployCommands = async (dev: boolean): Promise<void> => {
        try {
            this.logger.info(`Deploying ${this.commands.size} commands.`);
            await this.rest.put(dev
                ? Routes.applicationGuildCommands(this.user.id, config.dev.guildID)
                : Routes.applicationCommands(this.user.id)
            );
        } catch (err) {
            this.logger.error(`Gateway`, err);
        }
    };

    /**
     * Create a deny embed.
     * @param id The ID of the user running the command.
     * @param text The text to display.
     */
    createDenyEmbed = (user: User, text: string): EmbedBuilder => {
        const sEmbed = new EmbedBuilder()
            .setColor(this.config.colors.red)
            .setDescription(`${this.config.emojis.xmark} ${text}`)
            .setTimestamp()
            .setFooter({ text: `ID: ${user.id}` });

        return sEmbed;
    };
}
