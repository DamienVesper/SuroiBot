import {
    InteractionContextType,
    PermissionFlagsBits,
    SlashCommandBuilder,
    type ChatInputCommandInteraction
} from "discord.js";

import { Command, type ConfigType } from "../../classes/Command.js";
import { Case, CaseAction } from "../../models/Case.js";

class Kick extends Command {
    cmd = new SlashCommandBuilder()
        .setName("kick")
        .addUserOption(option => option.setName("user").setDescription("The user to kick.").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("The reason you are kicking the user."))
        .setDescription("Kick a user.")
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setContexts(InteractionContextType.Guild);

    config: ConfigType = {
        botPermissions: [
            PermissionFlagsBits.KickMembers
        ],
        userPermissions: [
            PermissionFlagsBits.KickMembers
        ],
        isSubcommand: false,
        cooldown: 0
    };

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (!interaction.inCachedGuild()) return;

        const user = interaction.options.getUser("user", true);
        const reason = interaction.options.getString("reason") ?? "No reason provided";

        const member = await interaction.guild.members.fetch(interaction.user.id);
        const target = await interaction.guild.members.fetch(user.id);

        if (!target) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "That user is not in the server.")], ephemeral: true });
            return;
        } else if (!target.kickable || target.user.bot) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "I cannot kick that user.")], ephemeral: true });
            return;
        } else if (target.roles.highest.comparePositionTo(member.roles.highest) >= 0) {
            await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, "You do not outrank that user.")], ephemeral: true });
            return;
        }

        await interaction.deferReply();

        const modCase = (await this.client.db.insert(Case).values({
            discordId: target.id,
            issuerId: interaction.user.id,
            guildId: interaction.guildId,
            reason,
            action: CaseAction.Kick
        } satisfies typeof Case.$inferInsert).returning())[0];

        const msg = await target.send({ embeds: [this.client.createDMCaseEmbed(modCase.id, CaseAction.Kick, interaction.guild, interaction.user, reason)] });
        await target.kick(reason)
            .then(async () => {
                await interaction.followUp({ embeds: [this.client.createReplyCaseEmbed(modCase.id, CaseAction.Kick, target.user, interaction.guild)] });
                if (this.client.config.modules.logging.enabled) {
                    const logChannel = await interaction.guild?.channels.fetch(this.client.config.modules.logging.channels.modLog);
                    const punishmentChannel = await interaction.guild?.channels.fetch(this.client.config.modules.logging.channels.punishmentLog);

                    if (logChannel?.isSendable()) await logChannel.send({ embeds: [this.client.createLogEmbed(modCase.id, CaseAction.Kick, interaction.user, target.user, reason)] });
                    if (punishmentChannel?.isSendable()) await punishmentChannel.send({ embeds: [this.client.createCaseEmbed(modCase.id, CaseAction.Kick, interaction.user, target.user, reason)] });
                }
            }).catch(async err => {
                this.client.logger.warn("Gateway", `Failed to kick: ${err.stack ?? err.message}`);
                await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "There was an error while kicking that user.")] });
                await msg.delete();
            });
    };
}

export default Kick;
