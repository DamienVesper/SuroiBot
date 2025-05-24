import {
    SlashCommandSubcommandBuilder,
    type ChatInputCommandInteraction
} from "discord.js";

import { Subcommand } from "../../../classes/Subcommand.js";

class View extends Subcommand {
    cmd = new SlashCommandSubcommandBuilder()
        .setName("view")
        .setDescription("View a game report.")
        .addStringOption(option => option.setName("id").setDescription("The report ID.").setRequired(true));

    config = {
        parent: "report",
        botPermissions: [],
        userPermissions: [],
        cooldown: 0
    };

    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        if (!interaction.inCachedGuild() || !this.client.suroi) return;

        const id = interaction.options.getString("id", true);
        await interaction.deferReply();

        const report = await this.client.suroi.fetchReport(id);
        if (report === null) {
            await interaction.followUp({ embeds: [this.client.createDenyEmbed(interaction.user, "That report could not be found!")] });
            return;
        }

        await interaction.followUp({ embeds: [this.client.createApproveEmbed(interaction.user, `Case **#${id}** is now inactive.`)] });
    };
}

export default View;
