import {
    EmbedBuilder,
    SlashCommandSubcommandBuilder,
    type ChatInputCommandInteraction
} from "discord.js";
import { and, eq } from "drizzle-orm";

import { Subcommand } from "../../../classes/Subcommand.js";

import { Case } from "../../../models/Case.js";

import { capitalize, numToCooldownFormat } from "../../../utils/utils.js";

class View extends Subcommand {
    cmd = new SlashCommandSubcommandBuilder()
        .setName("view")
        .setDescription("View a mod case.")
        .addNumberOption(option => option.setName("id").setDescription("The case number.").setRequired(true));

    config = {
        parent: "case",
        botPermissions: [],
        userPermissions: [],
        cooldown: 0
    };

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (!interaction.inCachedGuild()) return;

        const id = interaction.options.getNumber("id", true);
        await interaction.deferReply();

        const cases = await this.client.db.select({
            id: Case.id,
            action: Case.action,
            active: Case.active,
            createdAt: Case.createdAt,
            expiresAt: Case.expiresAt,
            targetId: Case.targetId,
            issuerId: Case.issuerId,
            reason: Case.reason
        }).from(Case).where(and(
            eq(Case.guildId, interaction.guildId),
            eq(Case.id, id)
        )).limit(1);

        if (cases.length === 0) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "The requested case could not be found.")] });
            return;
        }

        const modCase = cases[0];

        const perpetrator = await this.client.users.fetch(modCase.issuerId);
        const target = await this.client.users.fetch(modCase.targetId);

        const desc = [
            `**Active:** ${modCase.active ? this.client.config.emojis.checkmark : this.client.config.emojis.xmark}`,
            `**Action:** \`${capitalize(modCase.action)}\``,
            `**Date:** <t:${Math.floor(modCase.createdAt.getTime() / 1e3)}:f>`,
            target
                ? `**Target:** ${target.tag} (<@${modCase.targetId}>)`
                : `**Target:** <@${modCase.targetId}>`,
            perpetrator
                ? `**Moderator:** ${perpetrator.tag} (<@${modCase.issuerId}>)`
                : `**Moderator:** <@${modCase.issuerId}>`,
            `**Reason:** \`${modCase.reason}\``
        ];

        if (modCase.expiresAt) desc.splice(6, 0, `**Duration:** \`${numToCooldownFormat(modCase.expiresAt.valueOf() - modCase.createdAt.valueOf())}\``);

        const caseEmbed = new EmbedBuilder()
            .setColor(this.client.config.colors.orange)
            .setThumbnail(target.avatarURL())
            .setAuthor({ name: `Case #${id}` })
            .setDescription(desc.join("\n"))
            .setTimestamp()
            .setFooter({ text: `ID: ${modCase.issuerId}` });

        await interaction.followUp({ embeds: [caseEmbed] });
    };
}

export default View;
