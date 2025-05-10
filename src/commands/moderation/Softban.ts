import {
    InteractionContextType,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
    type ChatInputCommandInteraction
} from "discord.js";

import { Command, type ConfigType } from "../../classes/Command.js";
import { Case, CaseAction } from "../../models/Case.js";

class Softban extends Command {
    cmd = new SlashCommandBuilder()
        .setName("softban")
        .addUserOption(option => option.setName("user").setDescription("The user to ban.").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("The reason you are softbanning the user."))
        .setDescription("Softban a user.")
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

        const user = interaction.options.getUser("user", true);
        const reason = interaction.options.getString("reason") ?? "No reason provided";

        const member = await interaction.guild.members.fetch(interaction.user.id);
        const target = await interaction.guild.members.fetch(user.id);

        if (!target) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "That user is not in the server.")], flags: MessageFlags.Ephemeral });
            return;
        } else if (!target.bannable || target.id === this.client.user.id) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "I cannot ban that user.")], flags: MessageFlags.Ephemeral });
            return;
        } else if (target.roles.highest.comparePositionTo(member.roles.highest) >= 0) {
            await interaction.reply({ embeds: [this.client.createDenyEmbed(interaction.user, "You do not outrank that user.")], flags: MessageFlags.Ephemeral });
            return;
        }

        await interaction.deferReply();

        const modCase = (await this.client.db.insert(Case).values({
            discordId: target.id,
            issuerId: interaction.user.id,
            guildId: interaction.guildId,
            reason,
            action: CaseAction.Softban
        } satisfies typeof Case.$inferInsert).returning())[0];

        const msg = await target.send({ embeds: [this.client.createDMCaseEmbed(modCase.id, CaseAction.Softban, interaction.guild, interaction.user, reason)] });
        await target.ban({ reason, deleteMessageSeconds: 604800 })
            .then(async () => {
                await interaction.followUp({ embeds: [this.client.createReplyCaseEmbed(modCase.id, CaseAction.Softban, target.user, interaction.guild)] });
                if (this.client.config.modules.logging.enabled) {
                    const logChannel = await interaction.guild.channels.fetch(this.client.config.modules.logging.channels.modLog);
                    const punishmentChannel = await interaction.guild.channels.fetch(this.client.config.modules.logging.channels.punishmentLog);

                    if (logChannel?.isSendable()) await logChannel.send({ embeds: [this.client.createLogEmbed(modCase.id, CaseAction.Softban, interaction.user, target.user, reason)] });
                    if (punishmentChannel?.isSendable()) await punishmentChannel.send({ embeds: [this.client.createCaseEmbed(modCase.id, CaseAction.Softban, interaction.user, target.user, reason)] });
                }

                await interaction.guild.members.unban(target.id, `Softban | Case #${modCase.id}`)
                    .then(async () => {
                        await interaction.followUp({ embeds: [this.client.createReplyCaseEmbed(modCase.id, CaseAction.Softban, target.user, interaction.guild)] });
                    }).catch(err => {
                        console.error(err);
                        void interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "I could not unban that user.")] });
                    });
            }).catch(async err => {
                this.client.logger.warn("Gateway", `Failed to ban: ${err.stack ?? err.message}`);
                await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "There was an error while banning that user.")] });
                await msg.delete();
            });
    };
}

export default Softban;
