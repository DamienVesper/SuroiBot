import {
    ChannelType,
    EmbedBuilder,
    InteractionContextType,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
    type ChatInputCommandInteraction
} from "discord.js";

import { Command } from "../../classes/Command.js";
import { cleanse } from "../../utils/utils.js";

class Lockdown extends Command {
    cmd = new SlashCommandBuilder()
        .setName("lockdown")
        .setDescription("Lock / unlock the channel.")
        .addStringOption(option => option.setName("reason").setDescription("The reason you are locking / unlocking the channel."))
        .setContexts(InteractionContextType.Guild);

    config = {
        botPermissions: [],
        userPermissions: [],
        cooldown: 0
    };

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        /**
         * There is probably some type guard that I missed that will guarantee permissionsOverwrite.
         */
        if (!interaction.inCachedGuild() || (
            interaction.channel?.type !== ChannelType.GuildText
            && interaction.channel?.type !== ChannelType.GuildVoice
        )) return;

        /**
         * Allows for granular permissions on channels / categories themselves, rather than global (guild) permissions.
         */
        if (!interaction.channel.permissionsFor(interaction.member).has(PermissionFlagsBits.ManageChannels)) {
            await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, "You are missing the `ManageChannels` permission to execute this command.")], flags: MessageFlags.Ephemeral });
            return;
        }

        if (!interaction.channel.permissionsFor(interaction.guild.members.me!).has(PermissionFlagsBits.ManageChannels)) {
            await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, "I am missing the `ManageChannels` permission to execute this command.")], flags: MessageFlags.Ephemeral });
            return;
        }

        const reason = interaction.options.getString("reason") ?? "No reason provided";

        await interaction.deferReply();

        const isLocked = !interaction.channel.permissionsFor(interaction.guildId)?.has(PermissionFlagsBits.SendMessages);
        await interaction.channel.permissionOverwrites.edit(interaction.guildId, { SendMessages: !isLocked }, { reason: `${reason} - ${interaction.user.username}` })
            .then(async () => {
                await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, `**${isLocked ? "Locked" : "Unlocked"} #${interaction.channel!.name}.**`)] });

                if (this.client.config.modules.logging.enabled) {
                    const logChannel = await interaction.guild.channels.fetch(this.client.config.modules.logging.channels.modLog);

                    if (logChannel?.isSendable()) {
                        const logEmbed = new EmbedBuilder()
                            .setAuthor({ name: isLocked ? "Lock" : "Unlock" })
                            .setDescription([
                                `**<#${interaction.channelId}> was ${isLocked ? "locked" : "unlocked"}.**`,
                                "",
                                "### Responsible Moderator",
                                `<@${interaction.user.id}>`,
                                "",
                                "### Reason",
                                `\`\`\`${cleanse(reason)}\`\`\``
                            ].join("\n"))
                            .setTimestamp()
                            .setFooter({ text: `ID: ${interaction.channelId}` });

                        await logChannel.send({ embeds: [logEmbed] });
                    }
                }
            }).catch(async err => {
                this.client.logger.warn("Gateway", `Failed to modify channel permissions: ${err}`);
                await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "There was an error while updating the channel.")] });
            });
    };
}

export default Lockdown;
