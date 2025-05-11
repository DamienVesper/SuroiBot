import {
    PermissionFlagsBits,
    SlashCommandSubcommandBuilder,
    type ChatInputCommandInteraction
} from "discord.js";

import { Subcommand } from "../../../classes/Subcommand.js";

class Off extends Subcommand {
    cmd = new SlashCommandSubcommandBuilder()
        .setName("off")
        .setDescription("Turn off a case.")
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

export default Off;
