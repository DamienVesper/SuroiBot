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
    config: {
        botPermissions: bigint[]
        userPermissions: bigint[]
        isSubcommand: boolean
        cooldown: number
    } = {
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
