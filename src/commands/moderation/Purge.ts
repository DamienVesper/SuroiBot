import {
    EmbedBuilder,
    InteractionContextType,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
    type ChatInputCommandInteraction
} from "discord.js";

import { Command, type ConfigType } from "../../classes/Command.js";

class Purge extends Command {
    cmd = new SlashCommandBuilder()
        .setName("purge")
        .addIntegerOption(option => option.setName("amount").setDescription("The amount of messages to be deleted.").setMinValue(1).setMaxValue(100).setRequired(true))
        .addUserOption(option => option.setName("user").setDescription("The (optional) user to purge messages from."))
        .addStringOption(option => option.setName("reason").setDescription("The reason you are purging the messages."))
        .setDescription("Purge a channel's messages.")
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setContexts(InteractionContextType.Guild);

    config: ConfigType = {
        botPermissions: [
            PermissionFlagsBits.ManageMessages
        ],
        userPermissions: [
            PermissionFlagsBits.ManageMessages
        ],
        isSubcommand: false,
        cooldown: 0
    };

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (!interaction.inCachedGuild() || !interaction.channel?.isTextBased()) return;

        const amount = interaction.options.getNumber("amount", true);
        const target = interaction.options.getUser("user", true);
        const reason = interaction.options.getString("reason") ?? "No reason provided";

        let messages = await interaction.channel.messages.fetch({ limit: amount });
        if (target) messages = messages.filter(x => x.author.id === target.id);

        if (messages.size === 0) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "There are no messages to delete.")], flags: MessageFlags.Ephemeral });
            return;
        }

        await interaction.deferReply();
        await interaction.channel.bulkDelete?.(messages)
            .then(async () => {
                await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, `Deleted **${messages.size}** messages.`)] });
                if (this.client.config.modules.logging.enabled) {
                    const logChannel = await interaction.guild.channels.fetch(this.client.config.modules.logging.channels.modLog);
                    if (logChannel?.isSendable()) {
                        const sEmbed = new EmbedBuilder()
                            .setColor(this.client.config.colors.blue)
                            .setDescription([
                                `**<@${interaction.user.id}> purged ${messages.size} messages in <#${interaction.channel!.id}>.`,
                                "",
                                "**Reason**",
                                `\`\`\`${reason}\`\`\``
                            ].join("\n"))
                            .setTimestamp()
                            .setFooter({ text: `ID: ${interaction.user.id}` });
                        await logChannel.send({ embeds: [sEmbed] });
                    }
                }
            }).catch(async err => {
                this.client.logger.warn("Gateway", `Failed to delete messages: ${err.stack ?? err.message}`);
                await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "There was an error while bulk deleting messages.")] });
            });

        await Bun.sleep(5e3);
        await interaction.deleteReply();
    };
}

export default Purge;
