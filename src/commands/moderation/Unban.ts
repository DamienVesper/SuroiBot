import {
    EmbedBuilder,
    InteractionContextType,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
    type ChatInputCommandInteraction
} from "discord.js";

import { Command, type ConfigType } from "../../classes/Command.js";
import { Case, CaseAction } from "../../models/Case.js";
import { cleanse } from "../../utils/utils.js";

class Unban extends Command {
    cmd = new SlashCommandBuilder()
        .setName("unban")
        .addStringOption(option => option.setName("id").setDescription("The ID of user to ban.").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("The reason you are banning the user."))
        .setDescription("Unban a user.")
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setContexts(InteractionContextType.Guild);

    config: ConfigType = {
        botPermissions: [
            PermissionFlagsBits.BanMembers
        ],
        userPermissions: [
            PermissionFlagsBits.BanMembers
        ],
        isSubcommand: false,
        cooldown: 0
    };

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (!interaction.inCachedGuild()) return;

        const targetId = interaction.options.getString("id", true);
        const reason = interaction.options.getString("reason") ?? "No reason provided";

        const target = await interaction.guild.bans.fetch(targetId);
        if (target === null) {
            await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, "That user is not banned!")], flags: MessageFlags.Ephemeral });
            return;
        }

        await interaction.deferReply();

        const modCase = (await this.client.db.insert(Case).values({
            discordId: targetId,
            issuerId: interaction.user.id,
            guildId: interaction.guildId,
            reason,
            action: CaseAction.Unban
        } satisfies typeof Case.$inferInsert).returning())[0];

        await interaction.guild.members.unban(targetId, reason)
            .then(async () => {
                const replyEmbed = this.client.createEmbed(targetId, `${this.client.config.emojis.checkmark} **${targetId} was unbanned.`)
                    .setColor(this.client.config.colors.green);

                await interaction.followUp({ embeds: [replyEmbed] });

                if (this.client.config.modules.logging.enabled) {
                    const logChannel = await interaction.guild.channels.fetch(this.client.config.modules.logging.channels.modLog);
                    const punishmentChannel = await interaction.guild.channels.fetch(this.client.config.modules.logging.channels.punishmentLog);

                    if (logChannel?.isSendable()) {
                        const logEmbed = new EmbedBuilder()
                            .setAuthor({ name: target.user.tag })
                            .setDescription([
                                `**\`${targetId}\` (<@${targetId}>) was unbanned**.`,
                                "",
                                "**Responsible Moderator**",
                                `<@${interaction.user.id}>`,
                                "",
                                "**Reason**",
                                `\`\`\`${cleanse(reason)}\`\`\``
                            ].join("\n"))
                            .setTimestamp()
                            .setFooter({ text: `ID: ${targetId} | Case #${modCase.id}` });

                        await logChannel.send({ embeds: [logEmbed] });
                    }

                    if (punishmentChannel?.isSendable()) {
                        const caseEmbed = new EmbedBuilder()
                            .setColor(this.client.config.colors.orange)
                            .setAuthor({ name: `Unban | Case #${modCase.id}` })
                            .addFields([
                                {
                                    name: "User",
                                    value: `\`${targetId}\` (<@${targetId}>)`
                                },
                                {
                                    name: "Moderator",
                                    value: `${cleanse(interaction.user.displayName)} (<@${interaction.user.id}>)`
                                },
                                {
                                    name: "Reason",
                                    value: reason
                                }
                            ])
                            .setTimestamp()
                            .setFooter({ text: `ID: ${targetId}` });
                        await punishmentChannel.send({ embeds: [caseEmbed] });
                    }
                }
            }).catch(async err => {
                this.client.logger.warn("Gateway", `Failed to unban: ${err.stack ?? err.message}`);
                await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "There was an error while unbanning that user.")] });
            });
    };
}

export default Unban;
