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

class Warn extends Command {
    cmd = new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Warn a user.")
        .addUserOption(option => option.setName("user").setDescription("The user to warn.").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("The reason you are warning the user."))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setContexts(InteractionContextType.Guild);

    config = {
        botPermissions: [],
        userPermissions: [
            PermissionFlagsBits.ManageMessages
        ],
        cooldown: 0
    };

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (!interaction.inCachedGuild()) return;

        const user = interaction.options.getUser("user", true);
        const reason = interaction.options.getString("reason") ?? "No reason provided";

        const member = await interaction.guild.members.fetch(interaction.user.id);
        const target = await interaction.guild.members.fetch(user.id);

        if (!target) {
            await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, "That user is not in the server.")], flags: MessageFlags.Ephemeral });
            return;
        } else if (target.user.bot) {
            await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, "I cannot warn that user.")], flags: MessageFlags.Ephemeral });
            return;
        } else if (target.roles.highest.comparePositionTo(member.roles.highest) >= 0) {
            await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, "You do not outrank that user.")], flags: MessageFlags.Ephemeral });
            return;
        }

        await interaction.deferReply();

        const caseCount = (await this.client.db.select({ count: count() }).from(Case).where(eq(Case.guildId, interaction.guildId)))[0].count;
        const modCase = (await this.client.db.insert(Case).values({
            id: caseCount + 1,
            discordId: target.id,
            issuerId: interaction.user.id,
            guildId: interaction.guildId,
            reason,
            action: CaseAction.Warn
        } satisfies typeof Case.$inferInsert).returning())[0];

        await target.send({ embeds: [this.client.createDMCaseEmbed(modCase.id, CaseAction.Warn, interaction.guild, interaction.user, reason)] });
        await interaction.followUp({ embeds: [this.client.createReplyCaseEmbed(modCase.id, CaseAction.Warn, target.user)] });

        if (this.client.config.modules.logging.enabled) {
            const logChannel = await interaction.guild.channels.fetch(this.client.config.modules.logging.channels.modLog);
            const punishmentChannel = await interaction.guild.channels.fetch(this.client.config.modules.logging.channels.punishmentLog);

            if (logChannel?.isSendable()) await logChannel.send({ embeds: [this.client.createLogEmbed(modCase.id, CaseAction.Warn, interaction.user, target.user, reason)] });
            if (punishmentChannel?.isSendable()) await punishmentChannel.send({ embeds: [this.client.createCaseEmbed(modCase.id, CaseAction.Warn, interaction.user, target.user, reason)] });
        }
    };
}

export default Warn;
