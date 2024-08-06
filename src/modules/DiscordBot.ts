/* eslint-disable @typescript-eslint/no-misused-promises */
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
    type User,
    type TextBasedChannel,
    TextChannel,
    type InteractionReplyOptions,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type MessageCreateOptions,
    type BaseMessageOptions
} from 'discord.js';
import { Manager, Structure, type Player, type Track } from 'magmastream';

import { resolve } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { readdirSync } from 'fs';

import { Logger } from './Logger.js';
import { MusicPlayer } from './MusicPlayer.js';

import { Command } from '../classes/Command.js';
import type { Event } from '../classes/Event.js';

import { capitalize, numToDurationFormat } from '../utils/utils.js';

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
    subcommands = new Collection<Command[`cmd`][`name`], Command>();
    cooldowns = new Collection<Snowflake, Collection<Command[`cmd`][`name`], number>>();

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
            Structure.extend(`Player`, Player => MusicPlayer);
            this.lavalinkManager = new Manager({
                nodes: this.config.modules.music.lavalinkNodes,
                send: (id, payload) => {
                    const guild = this.guilds.cache.get(id);
                    if (guild) guild.shard.send(payload);
                }
            });

            let killPlayers: NodeJS.Timeout;

            this.lavalinkManager.on(`nodeConnect`, node => {
                this.logger.info(`Lavalink Manager`, `Connected to node ${node.options.identifier}.`);
            });

            this.lavalinkManager.on(`nodeDisconnect`, node => {
                this.logger.warn(`Lavalink Manager`, `Disconnected from node ${node.options.identifier}.`);

                // Kill all players after 30 seconds.
                killPlayers = setTimeout(() => {
                    this.lavalinkManager.players.filter(player => player.node === node).forEach(player => player.destroy());
                }, 3e4);
            });

            this.lavalinkManager.on(`nodeReconnect`, node => {
                // Reset and restart all players.
                clearInterval(killPlayers);
                this.lavalinkManager.players.filter(player => player.node === node).forEach(player => player.pause(false));
            });

            this.lavalinkManager.on(`nodeError`, (node, error) => {
                this.logger.error(`Lavalink Manager`, `Node ${node.options.identifier} encountered an error:`, error.message);
            });

            this.lavalinkManager.on(`queueEnd`, player => {
                const channel = this.channels.cache.get(player.textChannel!) as TextBasedChannel | null;

                void channel?.send({ embeds: [this.createEmbed(player.guild, `The queue has ended.`).setColor(this.config.colors.blue)] });
                player.destroy();
            });

            this.lavalinkManager.on(`trackStart`, (player, track) => {
                this.logger.debug(`Lavalink Node ${player.node.options.identifier}`, `Now playing "${track.title}"`);
                if (player.queue.length !== 0 && player.textChannel !== null) {
                    void this.channels.fetch(player.textChannel).then(channel => {
                        if (channel !== null && channel instanceof TextChannel) void channel.send(this.createNowPlayingDetails(player));
                    });
                }
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

            if (command.config.isSubcommand) this.subcommands.set(command.config.parent, command);
            else this.commands.set(command.cmd.name, command);
        }
    };

    /**
     * Deploy commands.
     * @param dev In development mode?
     */
    deployCommands = async (mode: typeof this.config.mode): Promise<void> => {
        try {
            this.logger.info(`Gateway`, `Deployed ${this.commands.size} commands.`);

            const commands = this.commands.map(command => command.cmd.toJSON());
            await this.rest.put(mode === `dev`
                ? Routes.applicationGuildCommands(this.user.id, config.dev.guildID)
                : Routes.applicationCommands(this.user.id)
            , { body: commands });
        } catch (err: any) {
            this.logger.error(`Gateway`, err.stack ?? err.message);
        }
    };

    /**
     * Create a simple text embed.
     * @param id The ID to display.
     * @param text The text to display.
     */
    createEmbed = (id: Snowflake, text: string): EmbedBuilder => {
        const sEmbed = new EmbedBuilder()
            .setColor(this.config.colors.gray)
            .setDescription(text)
            .setTimestamp()
            .setFooter({ text: `ID: ${id}` });

        return sEmbed;
    };

    /**
     * Create a deny embed.
     * @param user The interaction user.
     * @param text The text to display.
     */
    createDenyEmbed = (user: User, text: string): EmbedBuilder => this.createEmbed(user.id, `${this.config.emojis.xmark} ${text}`).setColor(this.config.colors.red);

    /**
     * Create an approve embed.
     * @param id The ID of the user running the command.
     * @param text The text to display.
     */
    createApproveEmbed = (user: User, text: string): EmbedBuilder => this.createEmbed(user.id, `${this.config.emojis.checkmark} ${text}`).setColor(this.config.colors.green);

    /**
     * Create an embed and action row component for the currently playing song.
     * @param player The player handling the queue.
     */
    createNowPlayingDetails = (player: Player): BaseMessageOptions => {
        // Assumes you have done the necessary type guarding for this.
        const song = player.queue.current! as Track;
        const sEmbed = new EmbedBuilder()
            .setColor(this.config.colors.blue)
            .setTitle(song.title)
            .setAuthor({ name: song?.author ?? `John Doe`, url: song.uri })
            .setDescription(`\`${numToDurationFormat(player.position)}\` / \`${numToDurationFormat(song.duration)}\``)
            .setFields([
                {
                    name: `Source`,
                    value: capitalize(song.sourceName),
                    inline: true
                },
                {
                    name: `Requester`,
                    value: song.requester?.displayName ?? song.requester?.tag ?? `John Doe`,
                    inline: true
                }
            ])
            .setThumbnail((song.artworkUrl ?? song.thumbnail))
            .setTimestamp()
            .setFooter({ text: `ID: ${song.requester?.id}` });

        const sRow = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(`View Track`).setURL(song.uri));

        return {
            embeds: [sEmbed],
            components: [sRow]
        };
    };
}
