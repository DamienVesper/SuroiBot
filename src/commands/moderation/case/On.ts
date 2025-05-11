import {
    PermissionFlagsBits,
    SlashCommandSubcommandBuilder,
    type ChatInputCommandInteraction
} from "discord.js";

import { Subcommand } from "../../../classes/Subcommand.js";

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
        console.log("hi");
    };
}

export default On;
