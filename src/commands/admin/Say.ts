import {
    InteractionContextType,
    PermissionFlagsBits,
    SlashCommandBuilder,
    type ChatInputCommandInteraction
} from 'discord.js';

import { Command, type ConfigType } from '../../classes/Command.js';

class Say extends Command {
    cmd = new SlashCommandBuilder()
        .setName(`say`)
        .addStringOption(option => option.setName(`message`).setDescription(`The message to say.`).setRequired(true))
        .setDescription(`Say something.`)
        .setContexts(InteractionContextType.Guild);

    config: ConfigType = {
        botPermissions: [
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.EmbedLinks
        ],
        userPermissions: [
            PermissionFlagsBits.UseApplicationCommands,
            PermissionFlagsBits.ManageMessages
        ],
        isSubcommand: false,
        cooldown: 0
    };

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (!interaction.channel?.isTextBased() || interaction.channel.isDMBased()) return;

        const message = interaction.options.getString(`message`, true);

        await interaction.reply({ embeds: [this.client.createApproveEmbed(interaction.user, `Your message was sent.`)], ephemeral: true });
        await interaction.deleteReply();

        await interaction.channel.send({ content: message }).catch(err => {
            this.client.logger.warn(`Gateway`, `Failed to send message: ${err.stack ?? err.message}`);
        });
    };
}

export default Say;
