import {
    InteractionContextType,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
    type ChatInputCommandInteraction
} from "discord.js";

import { Command } from "../../classes/Command.js";

class Say extends Command {
    cmd = new SlashCommandBuilder()
        .setName("say")
        .addStringOption(option => option.setName("message").setDescription("The message to say.").setRequired(true))
        .setDescription("Say something.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setContexts(InteractionContextType.Guild);

    config = {
        botPermissions: [
            PermissionFlagsBits.EmbedLinks
        ],
        userPermissions: [
            PermissionFlagsBits.Administrator
        ],
        cooldown: 0
    };

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (!interaction.inGuild() || !interaction.channel?.isTextBased()) return;

        const message = interaction.options.getString("message", true);

        await interaction.reply({ embeds: [this.client.createApproveEmbed(interaction.user, "Your message was sent.")], flags: MessageFlags.Ephemeral });

        /**
         * Send a message while disabling all mentions in the message.
         * People abuse this too frequently, so they will have to live with it.
         */
        await interaction.channel.send({
            content: message,
            allowedMentions: {
                parse: [],
                roles: [],
                users: []
            }
        }).then(async () => {
            await Bun.sleep(3e3);
            await interaction.deleteReply();
        }).catch(err => {
            this.client.logger.warn("Gateway", `Failed to send message: ${err.stack ?? err.message}`);
        });
    };
}

export default Say;
