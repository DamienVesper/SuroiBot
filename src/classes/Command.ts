import {
    PermissionFlagsBits,
    type ChatInputCommandInteraction,
    SlashCommandBuilder,
    type SlashCommandOptionsOnlyBuilder
} from 'discord.js';
import type { DiscordBot } from '../modules/DiscordBot.js';

export abstract class Command {
    client: DiscordBot;

    abstract cmd: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
    config: ConfigType = {
        botPermissions: [
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.EmbedLinks
        ],
        userPermissions: [
            PermissionFlagsBits.UseApplicationCommands
        ],
        isSubcommand: false,
        cooldown: 0
    };

    category?: string;

    constructor (client: DiscordBot) {
        this.client = client;
    }

    /**
     * Executed when receiving the interaction.
     * @param interaction The interaction received.
     */
    abstract run: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export type ConfigType =
    | {
        botPermissions: bigint[]
        userPermissions: bigint[]
        isSubcommand: true
        parent: SlashCommandBuilder[`name`]
        cooldown: number
    }
    | {
        botPermissions: bigint[]
        userPermissions: bigint[]
        isSubcommand: false
        cooldown: number
    };
