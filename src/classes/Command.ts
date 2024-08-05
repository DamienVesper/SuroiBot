import { PermissionFlagsBits, type ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { DiscordBot } from '../modules/DiscordBot.js';

export class Command {
    client: DiscordBot;
    cmd = new SlashCommandBuilder();

    config: {
        guildOnly: boolean
        botPermissions: bigint[]
        userPermissions: bigint[]
        isSubcommand: boolean
        cooldown: number
    } = {
            guildOnly: false,
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
