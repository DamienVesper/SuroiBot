import {
    PermissionFlagsBits,
    SlashCommandSubcommandBuilder,
    type ChatInputCommandInteraction
} from "discord.js";

import { Subcommand } from "../../../classes/Subcommand.js";

class View extends Subcommand {
    cmd = new SlashCommandSubcommandBuilder()
        .setName("view")
        .setDescription("View a mod case.");

    config = {
        parent: "case",
        botPermissions: [
            PermissionFlagsBits.BanMembers
        ],
        userPermissions: [
            PermissionFlagsBits.BanMembers
        ],
        cooldown: 0
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    run = async (interaction: ChatInputCommandInteraction): Promise<void> => {};
}

export default View;
