import {
    InteractionContextType,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
    type ChatInputCommandInteraction
} from "discord.js";
import { count, eq } from "drizzle-orm";

import { Command } from "../../classes/Command.js";
import { Case, CaseAction } from "../../models/Case.js";

import { durations } from "../../utils/utils.js";

class Ban extends Command {
    cmd = new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban a user.")
        .addUserOption(option => option.setName("user").setDescription("The user to ban.").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("The reason you are banning the user."))
        .addStringOption(option => option
            .setName("delete_messages")
            .setDescription("Duration of messages to remove. Defaults to 1d if not specified.")
            .setChoices(Object.entries(durations).map(([key, value]) => ({ name: key, value: value.toString() }))))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setContexts(InteractionContextType.Guild);

    config = {
        botPermissions: [
            PermissionFlagsBits.BanMembers
        ],
        userPermissions: [
            PermissionFlagsBits.BanMembers
        ],
        cooldown: 0
    };

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (!interaction.inCachedGuild()) return;

        const user = interaction.options.getUser("user", true);
        const reason = interaction.options.getString("reason") ?? "No reason provided";
        const deleteMessageSeconds = parseInt(interaction.options.getString("deleteMessages") ?? "86400");

        const member = await interaction.guild.members.fetch(interaction.user.id);
        const target = await interaction.guild.members.fetch(user.id);

        if (!target) {
            await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, "That user is not in the server.")], flags: MessageFlags.Ephemeral });
            return;
        } else if (!target.bannable || target.user.bot) {
            await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, "I cannot ban that user.")], flags: MessageFlags.Ephemeral });
            return;
        } else if (target.roles.highest.comparePositionTo(member.roles.highest) >= 0) {
            await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, "You do not outrank that user.")], flags: MessageFlags.Ephemeral });
            return;
        }

        await interaction.deferReply();

        const caseCount = (await this.client.db.select({ count: count() }).from(Case).where(eq(Case.guildId, interaction.guildId)))[0].count;
        const modCase = (await this.client.db.insert(Case).values({
            id: caseCount + 1,
            targetId: target.id,
            issuerId: interaction.user.id,
            guildId: interaction.guildId,
            reason,
            action: CaseAction.Ban
        } satisfies typeof Case.$inferInsert).returning())[0];

        const msg = await target.send({ embeds: [this.client.createDMCaseEmbed(modCase.id, CaseAction.Ban, interaction.guild, interaction.user, reason)] });
        await target.ban({ reason, deleteMessageSeconds })
            .then(async () => {
                await interaction.followUp({ embeds: [this.client.createReplyCaseEmbed(modCase.id, CaseAction.Ban, target.user)] });
                if (this.client.config.modules.logging.enabled) {
                    const logChannel = await interaction.guild.channels.fetch(this.client.config.modules.logging.channels.modLog);
                    const punishmentChannel = await interaction.guild.channels.fetch(this.client.config.modules.logging.channels.punishmentLog);

                    if (logChannel?.isSendable()) await logChannel.send({ embeds: [this.client.createLogEmbed(modCase.id, CaseAction.Ban, interaction.user, target.user, reason)] });
                    if (punishmentChannel?.isSendable()) await punishmentChannel.send({ embeds: [this.client.createCaseEmbed(modCase.id, CaseAction.Ban, interaction.user, target.user, reason)] });
                }
            }).catch(async err => {
                this.client.logger.warn("Gateway", `Failed to ban: ${err}`);
                await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "There was an error while banning that user.")] });
                await msg.delete();
            });
    };
}

export default Ban;
