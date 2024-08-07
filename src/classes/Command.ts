import {
    PermissionFlagsBits,
    type ChatInputCommandInteraction,
    SlashCommandBuilder,
    type SlashCommandOptionsOnlyBuilder
} from 'discord.js';
import type { DiscordBot } from '../modules/DiscordBot.js';

export class Command {
    client: DiscordBot;

    cmd: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder();
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

    category: string | undefined;

    constructor (client: DiscordBot) {
        this.client = client;
    }

    /**
     * Executed when receiving the interaction.
     * @param interaction The interaction received.
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {};
}

export type ConfigType<T = boolean> = T extends true
    ? {
        botPermissions: bigint[]
        userPermissions: bigint[]
        isSubcommand: T
        parent: SlashCommandBuilder[`name`]
        cooldown: number
    } : {
        botPermissions: bigint[]
        userPermissions: bigint[]
        isSubcommand: T
        cooldown: number
    };
