import { PermissionFlagsBits, SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';

import { Command } from '../../classes/Command.js';

class Say extends Command {
    cmd = new SlashCommandBuilder()
        .setName(`say`)
        .addStringOption(option => option.setName(`message`).setDescription(`The message to say.`).setRequired(true))
        .setDescription(`Say something.`)
        .setDMPermission(false);

    config = {
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
        if (interaction.guild === null) return;
        const message = interaction.options.getString(`message`, true);

        await interaction.deferReply();
        await interaction.channel?.send({ content: message }).catch(err => {
            this.client.logger.warn(`Gateway`, `Failed to send "say" message: No permission.`);
        });

        await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, `Your message was sent.`)], ephemeral: true });
        setTimeout(() => {
            void interaction.deleteReply();
        }, 3e3);
    };
}

export default Say;
