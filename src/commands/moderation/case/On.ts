import {
    PermissionFlagsBits,
    SlashCommandSubcommandBuilder,
    type ChatInputCommandInteraction
} from "discord.js";
import { and, eq } from "drizzle-orm";

import { Subcommand } from "../../../classes/Subcommand.js";

import { Case } from "../../../models/Case.js";

class On extends Subcommand {
    cmd = new SlashCommandSubcommandBuilder()
        .setName("on")
        .setDescription("Turn on a case.")
        .addNumberOption(option => option.setName("id").setDescription("The case number.").setRequired(true));

    config = {
        parent: "case",
        botPermissions: [],
        userPermissions: [
            PermissionFlagsBits.ManageMessages
        ],
        cooldown: 0
    };

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (!interaction.inCachedGuild()) return;

        const id = interaction.options.getNumber("id", true);
        await interaction.deferReply();

        const cases = await this.client.db.select({ active: Case.active }).from(Case).where(and(
            eq(Case.guildId, interaction.guildId),
            eq(Case.id, id)
        )).limit(1);

        if (cases.length === 0) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "The requested case could not be found.")] });
            return;
        }

        const modCase = cases[0];
        if (modCase.active) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "That case is already active.")] });
            return;
        }

        await this.client.db.update(Case).set({ active: true, updatedAt: new Date() }).where(and(
            eq(Case.guildId, interaction.guildId),
            eq(Case.id, id))
        );

        await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, `Case **#${id}** is now active.`)] });
    };
}

export default On;
