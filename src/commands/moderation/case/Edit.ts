import {
    PermissionFlagsBits,
    SlashCommandSubcommandBuilder,
    type ChatInputCommandInteraction
} from "discord.js";
import { and, eq } from "drizzle-orm";

import { Subcommand } from "../../../classes/Subcommand.js";

import { Case } from "../../../models/Case.js";

class Edit extends Subcommand {
    cmd = new SlashCommandSubcommandBuilder()
        .setName("edit")
        .setDescription("Edit the reason of a case.")
        .addNumberOption(option => option.setName("id").setDescription("The case number.").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("The new reason.").setRequired(true));

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
        const reason = interaction.options.getString("reason", true);

        await interaction.deferReply();

        await this.client.db.update(Case).set({ reason, updatedAt: new Date() }).where(and(
            eq(Case.guildId, interaction.guildId),
            eq(Case.id, id)
        ))
            .catch(() => interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "The requested case could not be found.")] }))
            .then(() => interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, `Updated reason for case #${id}.`)] }));
    };
}

export default Edit;
